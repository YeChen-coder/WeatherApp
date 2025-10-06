-- CreateTable
CREATE TABLE "saved_queries" (
    "id" SERIAL NOT NULL,
    "label" VARCHAR(255),
    "location_name" VARCHAR(255) NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "weather_data" JSONB NOT NULL,
    "geocoding_confidence" DECIMAL(3,2),
    "location_type" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_queries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_queries_location_name_idx" ON "saved_queries"("location_name");

-- CreateIndex
CREATE INDEX "saved_queries_start_date_end_date_idx" ON "saved_queries"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "saved_queries_created_at_idx" ON "saved_queries"("created_at" DESC);
