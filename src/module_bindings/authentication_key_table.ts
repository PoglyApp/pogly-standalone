// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN YOUR MODULE SOURCE CODE INSTEAD.

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
import {
  AlgebraicType,
  AlgebraicValue,
  BinaryReader,
  BinaryWriter,
  CallReducerFlags,
  ConnectionId,
  DbConnectionBuilder,
  DbConnectionImpl,
  DbContext,
  ErrorContextInterface,
  Event,
  EventContextInterface,
  Identity,
  ProductType,
  ProductTypeElement,
  ReducerEventContextInterface,
  SubscriptionBuilderImpl,
  SubscriptionEventContextInterface,
  SumType,
  SumTypeVariant,
  TableCache,
  TimeDuration,
  Timestamp,
  deepEqual,
} from "@clockworklabs/spacetimedb-sdk";
import { AuthenticationKey } from "./authentication_key_type";
import { EventContext, Reducer, RemoteReducers, RemoteTables } from ".";

/**
 * Table handle for the table `AuthenticationKey`.
 *
 * Obtain a handle from the [`authenticationKey`] property on [`RemoteTables`],
 * like `ctx.db.authenticationKey`.
 *
 * Users are encouraged not to explicitly reference this type,
 * but to directly chain method calls,
 * like `ctx.db.authenticationKey.on_insert(...)`.
 */
export class AuthenticationKeyTableHandle {
  tableCache: TableCache<AuthenticationKey>;

  constructor(tableCache: TableCache<AuthenticationKey>) {
    this.tableCache = tableCache;
  }

  count(): number {
    return this.tableCache.count();
  }

  iter(): Iterable<AuthenticationKey> {
    return this.tableCache.iter();
  }
  /**
   * Access to the `version` unique index on the table `AuthenticationKey`,
   * which allows point queries on the field of the same name
   * via the [`AuthenticationKeyVersionUnique.find`] method.
   *
   * Users are encouraged not to explicitly reference this type,
   * but to directly chain method calls,
   * like `ctx.db.authenticationKey.version().find(...)`.
   *
   * Get a handle on the `version` unique index on the table `AuthenticationKey`.
   */
  version = {
    // Find the subscribed row whose `version` column value is equal to `col_val`,
    // if such a row is present in the client cache.
    find: (col_val: number): AuthenticationKey | undefined => {
      for (let row of this.tableCache.iter()) {
        if (deepEqual(row.version, col_val)) {
          return row;
        }
      }
    },
  };

  onInsert = (cb: (ctx: EventContext, row: AuthenticationKey) => void) => {
    return this.tableCache.onInsert(cb);
  }

  removeOnInsert = (cb: (ctx: EventContext, row: AuthenticationKey) => void) => {
    return this.tableCache.removeOnInsert(cb);
  }

  onDelete = (cb: (ctx: EventContext, row: AuthenticationKey) => void) => {
    return this.tableCache.onDelete(cb);
  }

  removeOnDelete = (cb: (ctx: EventContext, row: AuthenticationKey) => void) => {
    return this.tableCache.removeOnDelete(cb);
  }

  // Updates are only defined for tables with primary keys.
  onUpdate = (cb: (ctx: EventContext, oldRow: AuthenticationKey, newRow: AuthenticationKey) => void) => {
    return this.tableCache.onUpdate(cb);
  }

  removeOnUpdate = (cb: (ctx: EventContext, onRow: AuthenticationKey, newRow: AuthenticationKey) => void) => {
    return this.tableCache.removeOnUpdate(cb);
  }}
