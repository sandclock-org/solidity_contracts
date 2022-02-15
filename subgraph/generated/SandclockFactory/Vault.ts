// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class DepositBurned extends ethereum.Event {
  get params(): DepositBurned__Params {
    return new DepositBurned__Params(this);
  }
}

export class DepositBurned__Params {
  _event: DepositBurned;

  constructor(event: DepositBurned) {
    this._event = event;
  }

  get id(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get shares(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get to(): Address {
    return this._event.parameters[2].value.toAddress();
  }
}

export class DepositMinted extends ethereum.Event {
  get params(): DepositMinted__Params {
    return new DepositMinted__Params(this);
  }
}

export class DepositMinted__Params {
  _event: DepositMinted;

  constructor(event: DepositMinted) {
    this._event = event;
  }

  get id(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get groupId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get shares(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get depositor(): Address {
    return this._event.parameters[4].value.toAddress();
  }

  get claimer(): Address {
    return this._event.parameters[5].value.toAddress();
  }

  get claimerId(): BigInt {
    return this._event.parameters[6].value.toBigInt();
  }

  get lockedUntil(): BigInt {
    return this._event.parameters[7].value.toBigInt();
  }

  get data(): Bytes {
    return this._event.parameters[8].value.toBytes();
  }
}

export class InvestPercentageUpdated extends ethereum.Event {
  get params(): InvestPercentageUpdated__Params {
    return new InvestPercentageUpdated__Params(this);
  }
}

export class InvestPercentageUpdated__Params {
  _event: InvestPercentageUpdated;

  constructor(event: InvestPercentageUpdated) {
    this._event = event;
  }

  get percentage(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class Invested extends ethereum.Event {
  get params(): Invested__Params {
    return new Invested__Params(this);
  }
}

export class Invested__Params {
  _event: Invested;

  constructor(event: Invested) {
    this._event = event;
  }

  get amount(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class Sponsored extends ethereum.Event {
  get params(): Sponsored__Params {
    return new Sponsored__Params(this);
  }
}

export class Sponsored__Params {
  _event: Sponsored;

  constructor(event: Sponsored) {
    this._event = event;
  }

  get id(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get amount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get depositor(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get lockedUntil(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class StrategyUpdated extends ethereum.Event {
  get params(): StrategyUpdated__Params {
    return new StrategyUpdated__Params(this);
  }
}

export class StrategyUpdated__Params {
  _event: StrategyUpdated;

  constructor(event: StrategyUpdated) {
    this._event = event;
  }

  get strategy(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class Unsponsored extends ethereum.Event {
  get params(): Unsponsored__Params {
    return new Unsponsored__Params(this);
  }
}

export class Unsponsored__Params {
  _event: Unsponsored;

  constructor(event: Unsponsored) {
    this._event = event;
  }

  get id(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class UserTrustUpdated extends ethereum.Event {
  get params(): UserTrustUpdated__Params {
    return new UserTrustUpdated__Params(this);
  }
}

export class UserTrustUpdated__Params {
  _event: UserTrustUpdated;

  constructor(event: UserTrustUpdated) {
    this._event = event;
  }

  get user(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get trusted(): boolean {
    return this._event.parameters[1].value.toBoolean();
  }
}

export class YieldClaimed extends ethereum.Event {
  get params(): YieldClaimed__Params {
    return new YieldClaimed__Params(this);
  }
}

export class YieldClaimed__Params {
  _event: YieldClaimed;

  constructor(event: YieldClaimed) {
    this._event = event;
  }

  get claimerId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get to(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get burnedShares(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class Vault__claimerResult {
  value0: BigInt;
  value1: BigInt;

  constructor(value0: BigInt, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }
}

export class Vault__depositsResult {
  value0: BigInt;
  value1: BigInt;
  value2: BigInt;
  value3: BigInt;

  constructor(value0: BigInt, value1: BigInt, value2: BigInt, value3: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    map.set("value3", ethereum.Value.fromUnsignedBigInt(this.value3));
    return map;
  }
}

export class Vault extends ethereum.SmartContract {
  static bind(address: Address): Vault {
    return new Vault("Vault", address);
  }

  MIN_SPONSOR_LOCK_DURATION(): BigInt {
    let result = super.call(
      "MIN_SPONSOR_LOCK_DURATION",
      "MIN_SPONSOR_LOCK_DURATION():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_MIN_SPONSOR_LOCK_DURATION(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "MIN_SPONSOR_LOCK_DURATION",
      "MIN_SPONSOR_LOCK_DURATION():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  SHARES_MULTIPLIER(): BigInt {
    let result = super.call(
      "SHARES_MULTIPLIER",
      "SHARES_MULTIPLIER():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_SHARES_MULTIPLIER(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "SHARES_MULTIPLIER",
      "SHARES_MULTIPLIER():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  _blockTimestamp(): BigInt {
    let result = super.call(
      "_blockTimestamp",
      "_blockTimestamp():(uint64)",
      []
    );

    return result[0].toBigInt();
  }

  try__blockTimestamp(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "_blockTimestamp",
      "_blockTimestamp():(uint64)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  claimer(param0: BigInt): Vault__claimerResult {
    let result = super.call("claimer", "claimer(uint256):(uint256,uint256)", [
      ethereum.Value.fromUnsignedBigInt(param0)
    ]);

    return new Vault__claimerResult(result[0].toBigInt(), result[1].toBigInt());
  }

  try_claimer(param0: BigInt): ethereum.CallResult<Vault__claimerResult> {
    let result = super.tryCall(
      "claimer",
      "claimer(uint256):(uint256,uint256)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Vault__claimerResult(value[0].toBigInt(), value[1].toBigInt())
    );
  }

  claimers(): Address {
    let result = super.call("claimers", "claimers():(address)", []);

    return result[0].toAddress();
  }

  try_claimers(): ethereum.CallResult<Address> {
    let result = super.tryCall("claimers", "claimers():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  depositors(): Address {
    let result = super.call("depositors", "depositors():(address)", []);

    return result[0].toAddress();
  }

  try_depositors(): ethereum.CallResult<Address> {
    let result = super.tryCall("depositors", "depositors():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  deposits(param0: BigInt): Vault__depositsResult {
    let result = super.call(
      "deposits",
      "deposits(uint256):(uint256,uint256,uint256,uint256)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );

    return new Vault__depositsResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toBigInt()
    );
  }

  try_deposits(param0: BigInt): ethereum.CallResult<Vault__depositsResult> {
    let result = super.tryCall(
      "deposits",
      "deposits(uint256):(uint256,uint256,uint256,uint256)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Vault__depositsResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
        value[2].toBigInt(),
        value[3].toBigInt()
      )
    );
  }

  investPerc(): BigInt {
    let result = super.call("investPerc", "investPerc():(uint256)", []);

    return result[0].toBigInt();
  }

  try_investPerc(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("investPerc", "investPerc():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  investableAmount(): BigInt {
    let result = super.call(
      "investableAmount",
      "investableAmount():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_investableAmount(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "investableAmount",
      "investableAmount():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  isTrusted(param0: Address): boolean {
    let result = super.call("isTrusted", "isTrusted(address):(bool)", [
      ethereum.Value.fromAddress(param0)
    ]);

    return result[0].toBoolean();
  }

  try_isTrusted(param0: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("isTrusted", "isTrusted(address):(bool)", [
      ethereum.Value.fromAddress(param0)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  minLockPeriod(): BigInt {
    let result = super.call("minLockPeriod", "minLockPeriod():(uint256)", []);

    return result[0].toBigInt();
  }

  try_minLockPeriod(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "minLockPeriod",
      "minLockPeriod():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  principalOf(claimerId: BigInt): BigInt {
    let result = super.call("principalOf", "principalOf(uint256):(uint256)", [
      ethereum.Value.fromUnsignedBigInt(claimerId)
    ]);

    return result[0].toBigInt();
  }

  try_principalOf(claimerId: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "principalOf",
      "principalOf(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(claimerId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  sharesOf(claimerId: BigInt): BigInt {
    let result = super.call("sharesOf", "sharesOf(uint256):(uint256)", [
      ethereum.Value.fromUnsignedBigInt(claimerId)
    ]);

    return result[0].toBigInt();
  }

  try_sharesOf(claimerId: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall("sharesOf", "sharesOf(uint256):(uint256)", [
      ethereum.Value.fromUnsignedBigInt(claimerId)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  strategy(): Address {
    let result = super.call("strategy", "strategy():(address)", []);

    return result[0].toAddress();
  }

  try_strategy(): ethereum.CallResult<Address> {
    let result = super.tryCall("strategy", "strategy():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  supportsInterface(interfaceId: Bytes): boolean {
    let result = super.call(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );

    return result[0].toBoolean();
  }

  try_supportsInterface(interfaceId: Bytes): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  totalPrincipal(): BigInt {
    let result = super.call("totalPrincipal", "totalPrincipal():(uint256)", []);

    return result[0].toBigInt();
  }

  try_totalPrincipal(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "totalPrincipal",
      "totalPrincipal():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  totalShares(): BigInt {
    let result = super.call("totalShares", "totalShares():(uint256)", []);

    return result[0].toBigInt();
  }

  try_totalShares(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("totalShares", "totalShares():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  totalSponsored(): BigInt {
    let result = super.call("totalSponsored", "totalSponsored():(uint256)", []);

    return result[0].toBigInt();
  }

  try_totalSponsored(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "totalSponsored",
      "totalSponsored():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  totalUnderlying(): BigInt {
    let result = super.call(
      "totalUnderlying",
      "totalUnderlying():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_totalUnderlying(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "totalUnderlying",
      "totalUnderlying():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  totalUnderlyingWithSponsor(): BigInt {
    let result = super.call(
      "totalUnderlyingWithSponsor",
      "totalUnderlyingWithSponsor():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_totalUnderlyingWithSponsor(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "totalUnderlyingWithSponsor",
      "totalUnderlyingWithSponsor():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  underlying(): Address {
    let result = super.call("underlying", "underlying():(address)", []);

    return result[0].toAddress();
  }

  try_underlying(): ethereum.CallResult<Address> {
    let result = super.tryCall("underlying", "underlying():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  yieldFor(_to: Address): BigInt {
    let result = super.call("yieldFor", "yieldFor(address):(uint256)", [
      ethereum.Value.fromAddress(_to)
    ]);

    return result[0].toBigInt();
  }

  try_yieldFor(_to: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall("yieldFor", "yieldFor(address):(uint256)", [
      ethereum.Value.fromAddress(_to)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _underlying(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _minLockPeriod(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _investPerc(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _owner(): Address {
    return this._call.inputValues[3].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ClaimYieldCall extends ethereum.Call {
  get inputs(): ClaimYieldCall__Inputs {
    return new ClaimYieldCall__Inputs(this);
  }

  get outputs(): ClaimYieldCall__Outputs {
    return new ClaimYieldCall__Outputs(this);
  }
}

export class ClaimYieldCall__Inputs {
  _call: ClaimYieldCall;

  constructor(call: ClaimYieldCall) {
    this._call = call;
  }

  get _to(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ClaimYieldCall__Outputs {
  _call: ClaimYieldCall;

  constructor(call: ClaimYieldCall) {
    this._call = call;
  }
}

export class DepositCall extends ethereum.Call {
  get inputs(): DepositCall__Inputs {
    return new DepositCall__Inputs(this);
  }

  get outputs(): DepositCall__Outputs {
    return new DepositCall__Outputs(this);
  }
}

export class DepositCall__Inputs {
  _call: DepositCall;

  constructor(call: DepositCall) {
    this._call = call;
  }

  get _params(): DepositCall_paramsStruct {
    return changetype<DepositCall_paramsStruct>(
      this._call.inputValues[0].value.toTuple()
    );
  }
}

export class DepositCall__Outputs {
  _call: DepositCall;

  constructor(call: DepositCall) {
    this._call = call;
  }
}

export class DepositCall_paramsStruct extends ethereum.Tuple {
  get amount(): BigInt {
    return this[0].toBigInt();
  }

  get claims(): Array<DepositCall_paramsClaimsStruct> {
    return this[1].toTupleArray<DepositCall_paramsClaimsStruct>();
  }

  get lockedUntil(): BigInt {
    return this[2].toBigInt();
  }
}

export class DepositCall_paramsClaimsStruct extends ethereum.Tuple {
  get pct(): i32 {
    return this[0].toI32();
  }

  get beneficiary(): Address {
    return this[1].toAddress();
  }

  get data(): Bytes {
    return this[2].toBytes();
  }
}

export class ForceWithdrawCall extends ethereum.Call {
  get inputs(): ForceWithdrawCall__Inputs {
    return new ForceWithdrawCall__Inputs(this);
  }

  get outputs(): ForceWithdrawCall__Outputs {
    return new ForceWithdrawCall__Outputs(this);
  }
}

export class ForceWithdrawCall__Inputs {
  _call: ForceWithdrawCall;

  constructor(call: ForceWithdrawCall) {
    this._call = call;
  }

  get _to(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _ids(): Array<BigInt> {
    return this._call.inputValues[1].value.toBigIntArray();
  }
}

export class ForceWithdrawCall__Outputs {
  _call: ForceWithdrawCall;

  constructor(call: ForceWithdrawCall) {
    this._call = call;
  }
}

export class SetInvestPercCall extends ethereum.Call {
  get inputs(): SetInvestPercCall__Inputs {
    return new SetInvestPercCall__Inputs(this);
  }

  get outputs(): SetInvestPercCall__Outputs {
    return new SetInvestPercCall__Outputs(this);
  }
}

export class SetInvestPercCall__Inputs {
  _call: SetInvestPercCall;

  constructor(call: SetInvestPercCall) {
    this._call = call;
  }

  get _investPerc(): i32 {
    return this._call.inputValues[0].value.toI32();
  }
}

export class SetInvestPercCall__Outputs {
  _call: SetInvestPercCall;

  constructor(call: SetInvestPercCall) {
    this._call = call;
  }
}

export class SetIsTrustedCall extends ethereum.Call {
  get inputs(): SetIsTrustedCall__Inputs {
    return new SetIsTrustedCall__Inputs(this);
  }

  get outputs(): SetIsTrustedCall__Outputs {
    return new SetIsTrustedCall__Outputs(this);
  }
}

export class SetIsTrustedCall__Inputs {
  _call: SetIsTrustedCall;

  constructor(call: SetIsTrustedCall) {
    this._call = call;
  }

  get user(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get trusted(): boolean {
    return this._call.inputValues[1].value.toBoolean();
  }
}

export class SetIsTrustedCall__Outputs {
  _call: SetIsTrustedCall;

  constructor(call: SetIsTrustedCall) {
    this._call = call;
  }
}

export class SetStrategyCall extends ethereum.Call {
  get inputs(): SetStrategyCall__Inputs {
    return new SetStrategyCall__Inputs(this);
  }

  get outputs(): SetStrategyCall__Outputs {
    return new SetStrategyCall__Outputs(this);
  }
}

export class SetStrategyCall__Inputs {
  _call: SetStrategyCall;

  constructor(call: SetStrategyCall) {
    this._call = call;
  }

  get _strategy(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetStrategyCall__Outputs {
  _call: SetStrategyCall;

  constructor(call: SetStrategyCall) {
    this._call = call;
  }
}

export class SponsorCall extends ethereum.Call {
  get inputs(): SponsorCall__Inputs {
    return new SponsorCall__Inputs(this);
  }

  get outputs(): SponsorCall__Outputs {
    return new SponsorCall__Outputs(this);
  }
}

export class SponsorCall__Inputs {
  _call: SponsorCall;

  constructor(call: SponsorCall) {
    this._call = call;
  }

  get _amount(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get _lockedUntil(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class SponsorCall__Outputs {
  _call: SponsorCall;

  constructor(call: SponsorCall) {
    this._call = call;
  }
}

export class UnsponsorCall extends ethereum.Call {
  get inputs(): UnsponsorCall__Inputs {
    return new UnsponsorCall__Inputs(this);
  }

  get outputs(): UnsponsorCall__Outputs {
    return new UnsponsorCall__Outputs(this);
  }
}

export class UnsponsorCall__Inputs {
  _call: UnsponsorCall;

  constructor(call: UnsponsorCall) {
    this._call = call;
  }

  get _to(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _ids(): Array<BigInt> {
    return this._call.inputValues[1].value.toBigIntArray();
  }
}

export class UnsponsorCall__Outputs {
  _call: UnsponsorCall;

  constructor(call: UnsponsorCall) {
    this._call = call;
  }
}

export class UpdateInvestedCall extends ethereum.Call {
  get inputs(): UpdateInvestedCall__Inputs {
    return new UpdateInvestedCall__Inputs(this);
  }

  get outputs(): UpdateInvestedCall__Outputs {
    return new UpdateInvestedCall__Outputs(this);
  }
}

export class UpdateInvestedCall__Inputs {
  _call: UpdateInvestedCall;

  constructor(call: UpdateInvestedCall) {
    this._call = call;
  }
}

export class UpdateInvestedCall__Outputs {
  _call: UpdateInvestedCall;

  constructor(call: UpdateInvestedCall) {
    this._call = call;
  }
}

export class WithdrawCall extends ethereum.Call {
  get inputs(): WithdrawCall__Inputs {
    return new WithdrawCall__Inputs(this);
  }

  get outputs(): WithdrawCall__Outputs {
    return new WithdrawCall__Outputs(this);
  }
}

export class WithdrawCall__Inputs {
  _call: WithdrawCall;

  constructor(call: WithdrawCall) {
    this._call = call;
  }

  get _to(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _ids(): Array<BigInt> {
    return this._call.inputValues[1].value.toBigIntArray();
  }
}

export class WithdrawCall__Outputs {
  _call: WithdrawCall;

  constructor(call: WithdrawCall) {
    this._call = call;
  }
}
