import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  varchar, 
  integer, 
  pgEnum,
  doublePrecision,
  bigint,
  boolean
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin", "client", "superadmin"]);
export const deviceTypeEnum = pgEnum("device_type", ["dvr", "nvr", "ip_camera", "server", "router", "switch", "other"]);
export const connectionTypeEnum = pgEnum("connection_type", ["ip", "ddns", "p2p", "qrcode"]);
export const statusEnum = pgEnum("status", ["online", "offline", "error", "pending"]);
export const resolutionEnum = pgEnum("resolution", ["sd", "hd", "fullhd", "4k"]);
export const notificationTypeEnum = pgEnum("notification_type", ["motion_detection", "alarm", "device_offline", "system_alert", "threshold"]);

/**
 * Monitoring Clients (for multi-tenancy and notifications)
 */
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  document: text("document").default(''),
  email: text("email").default(''),
  phone: text("phone").default(''),
  address: text("address").default(''),
  city: text("city").default(''),
  state: text("state").default(''),
  plan: text("plan").default('basic'),
  status: text("status").default('active'),
  telegramToken: text("telegram_token").default(''),
  telegramChatId: text("telegram_chat_id").default(''),
  alertEmail: text("alert_email").default(''),
  waInstance: text("wa_instance").default(''),
  waToken: text("wa_token").default(''),
  waNumber: text("wa_number").default(''),
  notes: text("notes").default(''),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Core user table
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).unique(), 
  username: text("username").unique(),
  passwordHash: text("password_hash"),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Devices table
 */
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  clientId: integer("client_id").references(() => clients.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  hostname: text("hostname").unique(),
  token: text("token").unique(),
  type: deviceTypeEnum("device_type").notNull().default("other"),
  connectionType: connectionTypeEnum("connection_type").notNull().default("ip"),
  ipAddress: varchar("ip_address", { length: 45 }),
  ddnsAddress: varchar("ddns_address", { length: 255 }),
  p2pId: varchar("p2p_id", { length: 255 }),
  username: varchar("username", { length: 255 }),
  password: varchar("password", { length: 255 }),
  port: integer("port").default(8000),
  monitorPort: integer("monitor_port").default(0),
  status: statusEnum("status").default("offline").notNull(),
  latency: integer("latency"), 
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Monitoring specific fields
  snmpCommunity: text("snmp_community").default('public'),
  snmpVersion: text("snmp_version").default('2c'),
  sshUser: text("ssh_user"),
  sshPort: integer("ssh_port").default(22),
  monitorPing: boolean("monitor_ping").default(true),
  monitorSnmp: boolean("monitor_snmp").default(false),
  monitorAgent: boolean("monitor_agent").default(true),
  macAddress: text("mac_address").default(''),
  serialNumber: text("serial_number").default(''),
  tags: text("tags").array().default([]),
  description: text("description").default(''),
  location: text("location").default(''),
});

/**
 * Monitoring Hosts
 */
export const hosts = pgTable("hosts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Infrastructure Metrics (TimescaleDB Hypertable)
 */
export const metrics = pgTable("metrics", {
  time: timestamp("time").notNull(),
  hostId: integer("host_id").references(() => hosts.id, { onDelete: 'cascade' }),
  host: text("host").notNull(),
  deviceId: integer("device_id").references(() => devices.id, { onDelete: 'set null' }),
  cpu: doublePrecision("cpu").notNull().default(0),
  memory: doublePrecision("memory").notNull().default(0),
  diskUsed: doublePrecision("disk_used").notNull().default(0),
  diskTotal: doublePrecision("disk_total").notNull().default(0),
  diskPercent: doublePrecision("disk_percent").notNull().default(0),
  netRxBytes: bigint("net_rx_bytes", { mode: 'bigint' }).notNull().default(0n),
  netTxBytes: bigint("net_tx_bytes", { mode: 'bigint' }).notNull().default(0n),
  latencyMs: doublePrecision("latency_ms").notNull().default(0),
  uptimeSeconds: bigint("uptime_seconds", { mode: 'bigint' }).notNull().default(0n),
  loadAvg: doublePrecision("load_avg").notNull().default(0),
  processes: integer("processes").notNull().default(0),
  temperature: doublePrecision("temperature").notNull().default(0),
  solarVoltage: doublePrecision("solar_voltage").default(0),
  batteryVoltage: doublePrecision("battery_voltage").default(0),
  batteryPercent: doublePrecision("battery_percent").default(0),
  chargeCurrent: doublePrecision("charge_current").default(0),
  loadCurrent: doublePrecision("load_current").default(0),
});

/**
 * Cameras table
 */
export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  channelNumber: integer("channel_number").notNull(),
  rtspUrl: varchar("rtsp_url", { length: 500 }),
  resolution: resolutionEnum("resolution").default("hd").notNull(),
  isPtzEnabled: integer("is_ptz_enabled").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Favorites table
 */
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 50 }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Favorite cameras
 */
export const favoriteCameras = pgTable("favorite_cameras", {
  id: serial("id").primaryKey(),
  favoriteId: integer("favorite_id").notNull(),
  cameraId: integer("camera_id").notNull(),
  order: integer("order").default(0),
});

/**
 * Notifications table
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceId: integer("device_id"),
  cameraId: integer("camera_id"),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isRead: integer("is_read").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * PTZ Presets
 */
export const ptzPresets = pgTable("ptz_presets", {
  id: serial("id").primaryKey(),
  cameraId: integer("camera_id").notNull(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  panPosition: integer("pan_position"),
  tiltPosition: integer("tilt_position"),
  zoomLevel: integer("zoom_level"),
  presetNumber: integer("preset_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Triggers for monitoring
 */
export const triggers = pgTable("triggers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  expression: text("expression").notNull(),
  threshold: doublePrecision("threshold").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  clientId: integer("client_id").references(() => clients.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Monitoring Alerts
 */
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  triggerId: integer("trigger_id").references(() => triggers.id, { onDelete: 'cascade' }),
  deviceId: integer("device_id").references(() => devices.id, { onDelete: 'set null' }),
  host: text("host").notNull(),
  expression: text("expression").notNull(),
  value: doublePrecision("value").notNull(),
  threshold: doublePrecision("threshold").notNull(),
  alertType: text("alert_type").notNull().default('threshold'),
  firedAt: timestamp("fired_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});
