-- Initialize TimescaleDB and Hypertables
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- The metrics table is created by Drizzle, but we need to make it a hypertable
-- We'll use a procedure or just a raw SQL execution in the server startup
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM _timescaledb_catalog.hypertable WHERE table_name = 'metrics') THEN
        PERFORM create_hypertable('metrics', 'time', if_not_exists => TRUE);
    END IF;
END $$;

-- Optional: Compression and retention
-- ALTER TABLE metrics SET (timescaledb.compress, timescaledb.compress_segmentby = 'host_id');
-- SELECT add_compression_policy('metrics', INTERVAL '7 days');
-- SELECT add_retention_policy('metrics', INTERVAL '30 days');
