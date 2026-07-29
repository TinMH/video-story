-- Kích hoạt extension tạo UUID tự động
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. QUẢN LÝ NGƯỜI DÙNG VÀ DỰ ÁN
-- =========================================================================

CREATE TYPE user_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    plan user_plan DEFAULT 'free',
    credits INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE project_status AS ENUM ('draft', 'processing', 'completed', 'failed');
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    status project_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- BƯỚC 1: DEVELOP A STORY & CREATE THE CHARACTER (Ý tưởng kịch bản & Nhân vật)
-- =========================================================================

-- Lưu trữ cốt truyện tổng thể do LLM tạo ra từ ý tưởng ban đầu
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_prompt TEXT NOT NULL,          -- Ý tưởng gốc của người dùng nhập vào
    generated_script TEXT,              -- Bản lưu kịch bản thô dạng văn bản nếu cần
    llm_provider VARCHAR(50),           -- 'openai', 'anthropic', 'groq', v.v.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quản lý thông tin nhân vật (Do LLM trích xuất hoặc người dùng tự tạo)
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    reference_image_url TEXT,          -- Ảnh gốc tải lên để làm face reference
    thumbnail_url TEXT,
    gender VARCHAR(50),
    age INT,
    -- Dùng JSONB để lưu trữ linh hoạt: hair, race, clothing, face_description, body_description
    features_metadata JSONB DEFAULT '{}'::jsonb, 
    seed BIGINT DEFAULT -1,
    is_favorite BOOLEAN DEFAULT FALSE,
    ai_embeddings JSONB DEFAULT '{}'::jsonb, -- Sẵn sàng cho việc nhúng face vector hoặc LoRA ID sau này
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kho phong cách chung hoặc hệ thống Marketplace (Giúp đồng bộ visual)
CREATE TABLE styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    thumbnail_url TEXT,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- BƯỚC 2: GENERATE THE IMAGES FOR ANIMATION VIDEO (Phân cảnh & Ảnh tĩnh)
-- =========================================================================

-- Quản lý thông tin phân cảnh (Tự động tạo ra từ bảng stories hoặc thêm thủ công)
CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE, -- Liên kết với kịch bản tổng thể
    scene_order INT NOT NULL,           -- Thứ tự phân cảnh trong kịch bản (Cảnh 1, Cảnh 2...)
    name VARCHAR(100) NOT NULL,
    background_prompt TEXT NOT NULL,    -- Prompt mô tả bối cảnh
    story_narration TEXT,               -- Lời thoại, lời dẫn hoặc phụ đề của phân cảnh này
    -- Lưu trữ linh hoạt: lighting, camera_angle, environment, aspect_ratio
    config_metadata JSONB DEFAULT '{}'::jsonb,
    thumbnail_url TEXT,                 -- Ảnh keyframe tĩnh được chọn cuối cùng để làm video
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quản lý các phụ kiện, vật thể xuất hiện trong bối cảnh
CREATE TABLE props (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),                   -- Wearable (mặc trên người), Static (đồ vật tĩnh), v.v.
    prompt TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- BƯỚC 3: CONVERT IMAGES TO VIDEOS (Chuyển động & Hàng đợi sinh video)
-- =========================================================================

-- Thư viện các hiệu ứng chuyển động mẫu
CREATE TABLE motions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Nếu NULL tức là motion mặc định của hệ thống
    name VARCHAR(100) NOT NULL,
    motion_prompt TEXT NOT NULL,        -- Prompt mô tả hành động gửi sang AI video
    camera_movement VARCHAR(100),       -- Hướng camera (Pan, Zoom, Tilt)
    default_intensity NUMERIC(3,2) DEFAULT 1.00, -- Cường độ chuyển động (Motion bucket id)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trung tâm điều phối và theo dõi tiến độ của Pipeline AI (Cả Text-to-Image và Image-to-Video)
CREATE TYPE gen_status AS ENUM ('queued', 'preparing', 'generating_image', 'generating_video', 'upscaling', 'completed', 'failed');
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Lưu vết các Asset được sử dụng tại thời điểm bấm nút Generate
    character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,
    motion_id UUID REFERENCES motions(id) ON DELETE SET NULL,
    style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
    
    status gen_status DEFAULT 'queued',
    progress INT DEFAULT 0,             -- Tiến độ xử lý thực tế từ 0 đến 100%
    
    -- Lưu cấu trúc chuỗi Master Prompt cuối cùng đã compile để phục vụ debug
    compiled_prompt_metadata JSONB NOT NULL, 
    
    provider VARCHAR(50),               -- Tên bên cung cấp dịch vụ AI ('fal_ai', 'replicate', 'kling_api')
    model_name VARCHAR(100),            -- Tên mô hình sử dụng ('flux-dev', 'kling-v2', 'svd')
    cost_credits INT DEFAULT 0,         -- Số credit tiêu tốn cho lượt gen này
    generation_time_seconds INT,       -- Thời gian xử lý của AI
    error_message TEXT,                 -- Chi tiết lỗi nếu trạng thái là 'failed'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lưu trữ tất cả tệp tin trung gian và thành phẩm được sinh ra từ quá trình Generation
CREATE TYPE file_type AS ENUM ('reference', 'image_base', 'video_preview', 'video_final', 'thumbnail');
CREATE TABLE generated_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generation_id UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
    type file_type NOT NULL,
    url TEXT NOT NULL,                  -- Đường dẫn tệp tin lưu trên S3 / R2 Cloud Storage
    width INT,
    height INT,
    duration_seconds NUMERIC(4,2),      -- Thời lượng (đặc biệt phù hợp lưu các clip ngắn 3.00s)
    fps INT,
    file_size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- QUẢN LÝ ĐẦU RA (Timeline & Biên tập Video)
-- =========================================================================

-- Quản lý thứ tự sắp xếp các đoạn clip ngắn để chuẩn bị xuất thành phim hoàn chỉnh
CREATE TABLE timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    display_order INT NOT NULL,         -- Thứ tự hiển thị của clip (Tự động map theo scene_order hoặc xếp thủ công)
    generated_file_id UUID NOT NULL REFERENCES generated_files(id) ON DELETE CASCADE, -- File video final được chọn
    duration_seconds NUMERIC(4,2) DEFAULT 3.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Đảm bảo trong cùng một project không có hai clip bị trùng vị trí hiển thị
    CONSTRAINT unique_project_order UNIQUE (project_id, display_order)
);

-- Quản lý các tệp video thành phẩm sau khi nối (merge) toàn bộ timeline lại với nhau
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    video_url TEXT,
    status export_status DEFAULT 'pending',
    resolution VARCHAR(20) DEFAULT '1080x1920',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);