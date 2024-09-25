Table "slots" {
  "uuid" uuid [pk, not null, default: `gen_random_uuid()`]
  "shift_type" varchar(50) [not null]
  "shift_date" date [not null]
  "start_time" time [not null]
  "end_time" time [not null]
  "created" timestamptz [not null, default: `now()`]
  "last_modified" timestamptz
}

Table "status_messages" {
  "id" uuid [pk, not null, default: `gen_random_uuid()`]
  "message" text [not null]
  "type" varchar(50) [not null]
  "active" bool [not null, default: true]
  "created_at" timestamp [not null, default: `CURRENT_TIMESTAMP`]
  "updated_at" timestamp [not null, default: `CURRENT_TIMESTAMP`]
}

Table "user_availability" {
  "user_uuid" uuid [not null]
  "slot_uuid" uuid [not null]

  Indexes {
    (user_uuid, slot_uuid) [type: btree, name: "user_availability_pkey"]
  }
}

Table "user_slot_trades" {
  "owner_uuid" uuid [not null]
  "slot_uuid" uuid [not null]
  "trade_with_uuid" uuid [not null]
  "trade_with_confirmed" bool [not null, default: false]
  "requested_date" timestamptz [not null, default: `now()`]

  Indexes {
    (owner_uuid, slot_uuid, trade_with_uuid) [type: btree, name: "user_slot_trades_pkey"]
  }
}

Table "user_slots" {
  "user_uuid" uuid [not null]
  "slot_uuid" uuid [not null]

  Indexes {
    (user_uuid, slot_uuid) [type: btree, name: "user_slots_pkey"]
  }
}

Table "users" {
  "uuid" uuid [pk, not null, default: `gen_random_uuid()`]
  "username" varchar(255) [unique, not null]
  "password" varchar(255)
  "email" varchar(255) [unique, not null]
  "type" varchar(50) [not null]
  "reset_token" varchar(255) [unique]
}

Ref "user_availability_slot_uuid_fkey":"slots"."uuid" < "user_availability"."slot_uuid" [delete: cascade]

Ref "user_availability_user_uuid_fkey":"users"."uuid" < "user_availability"."user_uuid" [delete: cascade]

Ref "user_slot_trades_owner_uuid_fkey":"users"."uuid" < "user_slot_trades"."owner_uuid" [delete: cascade]

Ref "user_slot_trades_slot_uuid_fkey":"slots"."uuid" < "user_slot_trades"."slot_uuid" [delete: cascade]

Ref "user_slot_trades_trade_with_uuid_fkey":"users"."uuid" < "user_slot_trades"."trade_with_uuid" [delete: cascade]

Ref "user_slots_slot_uuid_fkey":"slots"."uuid" < "user_slots"."slot_uuid" [delete: cascade]

Ref "user_slots_user_uuid_fkey":"users"."uuid" < "user_slots"."user_uuid" [delete: cascade]
