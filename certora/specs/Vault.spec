import "erc20.spec"

using MockStrategySync as strategy
using MockLUSD as underlying

methods {
    // state changing functions
    deposit(address, uint64, uint256, uint16[], address[], bytes[], uint256)
    depositForGroupId(uint256, address, uint64, uint256, uint16[], address[], bytes[], uint256)
    withdraw(address, uint256[])
    forceWithdraw(address, uint256[])
    partialWithdraw(address, uint256[], uint256[])
    claimYield(address)
    sponsor(address, uint256, uint256, uint256)
    unsponsor(address, uint256[])
    partialUnsponsor(address, uint256[], uint256[])

    // admin/settings/keeper functions
    transferAdminRights(address)
    pause()
    unpause()
    exitPause()
    exitUnpause()
    addPool(address, address, int128, int128)
    removePool(address)
    setInvestPct(uint16)
    setTreasury(address)
    setPerfFeePct(uint16)
    setStrategy(address)
    setLossTolerancePct(uint16)
    updateInvested()
    withdrawPerformanceFee()

    // view functions
    maxInvestableAmount() returns (uint256) envfree
    alreadyInvested() returns (uint256) envfree
    claimableYield(address) returns (uint256) envfree
    claimableShares(address) returns (uint256) envfree
    perfFee(address) returns (uint256) envfree
    getUnderlying() returns (address) envfree
    totalUnderlying() returns (uint256) envfree
    totalUnderlyingMinusSponsored() returns (uint256) envfree
    sharesOf(address) returns (uint256) envfree
    principalOf(address) returns (uint256) envfree
    depositGroupOwner(uint256) returns (address) envfree
    depositAmount(uint256) returns (uint256) envfree
    depositOwner(uint256) returns (address) envfree
    depositClaimer(uint256) returns (address) envfree
    depositLockedUntil(uint256) returns (uint256) envfree
    totalSharesOf(address[]) returns (uint256) envfree
    totalPrincipalOf(address[]) returns (uint256) envfree
    totalDeposits(uint256[]) returns (uint256) envfree
    totalSharesOf(uint256[]) returns (uint256) envfree
    totalPrincipalOf(uint256[]) returns (uint256) envfree

    // public variables
    underlying() returns (address) envfree
    minLockPeriod() returns (uint64) envfree
    treasury() returns (address) envfree
    investPct() returns (uint16) envfree
    perfFeePct() returns (uint16) envfree
    totalSponsored() returns (uint256) envfree
    totalShares() returns (uint256) envfree
    totalPrincipal() returns (uint256) envfree
    accumulatedPerfFee() returns (uint256) envfree
    paused() returns (bool) envfree
    exitPaused() returns (bool) envfree

    // erc20
    underlying.balanceOf(address) returns (uint256) envfree
}

definition excludeSponsor(method f) returns bool =
    f.selector != sponsor(address, uint256, uint256, uint256).selector
    &&
    f.selector != unsponsor(address, uint256[]).selector
    &&
    f.selector != partialUnsponsor(address, uint256[], uint256[]).selector;

definition excludeSetInvestPct(method f) returns bool =
    f.selector != setInvestPct(uint16).selector;

definition excludeWithdrawals(method f) returns bool =
    f.selector != unsponsor(address, uint256[]).selector
    &&
    f.selector != partialUnsponsor(address, uint256[], uint256[]).selector
    &&
    f.selector != withdraw(address, uint256[]).selector
    &&
    f.selector != forceWithdraw(address, uint256[]).selector
    &&    
    f.selector != partialWithdraw(address, uint256[], uint256[]).selector
    &&
    f.selector != claimYield(address).selector
    &&
    f.selector != withdrawPerformanceFee().selector;

// PCT_DIVISOR constant in PercentMath lib
definition PCT_DIVISOR() returns uint256 = 10000;

// pctOf function in PercentMath lib
function pctOf(uint256 _amount, uint16 _fracNum) returns uint256 {
    return to_uint256(_amount * _fracNum / PCT_DIVISOR());
}

ghost sumOfDeposits() returns uint256 {
    init_state axiom sumOfDeposits() == 0;
}

hook Sstore deposits[KEY uint256 k].(offset 0) uint256 amount (uint256 oldAmount) STORAGE {
    havoc sumOfDeposits assuming sumOfDeposits@new() == sumOfDeposits@old() + (amount - oldAmount);
}

/*
    @Invariant

    @Description:
        the state variable totalPrincipal's value should be always equal to the sum of 
        deposits made by depositors (sponsors are not depositors)
*/
invariant tatalPrincipal_equals_sum_of_deposits()
    totalPrincipal() == sumOfDeposits()
    filtered{f -> excludeSponsor(f)}


ghost sumOfClaimerPrincipal() returns uint256  {
    init_state axiom sumOfClaimerPrincipal() == 0;
}

hook Sstore claimer[KEY address k].(offset 0) uint256 amount (uint256 oldAmount) STORAGE {
    havoc sumOfClaimerPrincipal assuming sumOfClaimerPrincipal@new() == sumOfClaimerPrincipal@old() + (amount - oldAmount);
}

/*
    @Invariant

    @Description:
        the state variable totalPrincipal's value should be always equal to the sum of 
        claimer's principal
*/
invariant tatalPrincipal_equals_sum_of_claimer_principal()
    totalPrincipal() == sumOfClaimerPrincipal()


ghost sumOfClaimerShares() returns uint256   {
    init_state axiom sumOfClaimerShares() == 0;
}

hook Sstore claimer[KEY uint256 k].(offset 32) uint256 amount (uint256 oldAmount) STORAGE {
    havoc sumOfClaimerShares assuming sumOfClaimerShares@new() == sumOfClaimerShares@old() + (amount - oldAmount);
}

/*
    @Invariant

    @Description:
        the tate variable totalShares' value should be always equal to the sum of 
        claimer's shares
*/
invariant tatalShares_equals_sum_of_claimer_shares()
    totalShares() == sumOfClaimerShares()

/*
    @Invariant

    @Description:
        Any individual user's shares and principal should be less than or equal to the totals

    TODO - investigate violations in 
           https://prover.certora.com/output/15154/bbe90411a32bd6523963?anonymousKey=dff7a4fa037d1dfa4628b8fb4f8282fb6e091af0
           It looks due to uint arithmetic rounding
*/
invariant individual_shares_principal_le_total(address user)
    sharesOf(user) <= totalShares() 
    && 
    principalOf(user) <= totalPrincipal()
    &&
    (sharesOf(user) == totalShares() <=> principalOf(user) == totalPrincipal())
    &&
    (sharesOf(user) < totalShares() <=> principalOf(user) < totalPrincipal())
    {
        preserved {
            requireInvariant tatalPrincipal_equals_sum_of_claimer_principal();
            requireInvariant tatalShares_equals_sum_of_claimer_shares();
        }
    }

/*
    @Invariant

    @Description:
        the state variable totalShares' value should be consistent with the state variable totalPrincipal's value, i.e, 
        they are either both 0 or greater than 0
    
    TODO - investigate violations in
         - https://prover.certora.com/output/15154/e00d2330e3d97a4c0456?anonymousKey=c4d0aec081d477674ce00e68087456622605016c
           It looks due to uint arithmetic rounding
*/
invariant shares_principal_consistency()
    totalPrincipal() == 0 <=> totalShares() == 0 && totalPrincipal() > 0 <=> totalShares() > 0
    {
        preserved sharesOf(address user) {
            requireInvariant individual_shares_principal_le_total(user);
        }
        preserved principalOf(address user) {
            requireInvariant individual_shares_principal_le_total(user);
        }
    }


/*
    @Rule

    @Category: high level

    @Description:
        price per share, i.e., totalUnderlyingMinusSponsored() / totalShares should be preserved, or
        both totalUnderlyingMinusSponsored() and totalShares become 0 after any function calls.

    TODO - investigate violations in 
           https://prover.certora.com/output/15154/6f4601e838ab9a26adb0?anonymousKey=e1374529223eb7bf10fff0423b590617ec901648
*/
rule price_per_share_preserved(method f) {
    require totalUnderlyingMinusSponsored() != 0 && totalShares() != 0;
    uint256 pricePerShare = totalUnderlyingMinusSponsored() / totalShares();
    env e;
    require e.msg.sender != strategy; // safe to assume stragety will never call any function in Vault
    calldataarg args;
    f(e, args);
    assert 
        totalShares() == 0 && totalUnderlyingMinusSponsored() == 0 
        || 
        pricePerShare == totalUnderlyingMinusSponsored() / totalShares();
}


/*
    @Rule

    @Category: high level

    @Description:
        only claimYield, deposit and withdraw functions can change claimer's shares
*/
rule only_claim_deposits_withdraw_change_claimer_shares(address claimer, method f) {
    uint256 _shares = sharesOf(claimer);
    env e;
    calldataarg args;
    f(e, args);
    uint256 shares_ = sharesOf(claimer);
    assert _shares != shares_ =>
        (
            f.selector == claimYield(address).selector
            ||
            f.selector == deposit(address, uint64, uint256, uint16[], address[], bytes[], uint256).selector
            ||
            f.selector == deposit((address,uint64,uint256,(uint16,address,bytes)[],string,uint256)).selector
            ||
            f.selector == depositForGroupId(uint256, address, uint64, uint256, uint16[], address[], bytes[], uint256).selector
            ||
            f.selector == depositForGroupId(uint256, (address,uint64,uint256,(uint16,address,bytes)[],string,uint256)).selector
            ||
            f.selector == withdraw(address, uint256[]).selector
            ||
            f.selector == forceWithdraw(address, uint256[]).selector
            ||
            f.selector == partialWithdraw(address, uint256[], uint256[]).selector
        );
}


/*
    @Rule

    @Category: high level

    @Description:
        only deposit and withdraw functions can change claimer's principal
*/
rule only_deposits_withdraw_change_claimer_principal(address claimer, method f) {
    uint256 _principal = principalOf(claimer);
    env e;
    calldataarg args;
    f(e, args);
    uint256 principal_ = principalOf(claimer);
    assert _principal != principal_ =>
        (
            f.selector == deposit(address, uint64, uint256, uint16[], address[], bytes[], uint256).selector
            ||
            f.selector == deposit((address,uint64,uint256,(uint16,address,bytes)[],string,uint256)).selector
            ||
            f.selector == depositForGroupId(uint256, address, uint64, uint256, uint16[], address[], bytes[], uint256).selector
            ||
            f.selector == depositForGroupId(uint256, (address,uint64,uint256,(uint16,address,bytes)[],string,uint256)).selector
            ||
            f.selector == withdraw(address, uint256[]).selector
            ||
            f.selector == forceWithdraw(address, uint256[]).selector
            ||
            f.selector == partialWithdraw(address, uint256[], uint256[]).selector
        );
}


/*
    @Invariant

    @Description:
        Without a strategy or a strategy not making money, 
        investState().maxInvestableAmount >= investState().alreadyInvested
*/
invariant maxInvestableAmount_ge_alreadyInvested()
    maxInvestableAmount() >= alreadyInvested()
    filtered{f -> excludeSetInvestPct(f) && excludeWithdrawals(f)}


/*
    @Invariant

    @Description:
        the underlying public variable should always be the same with the return value of getUnderlying() function
*/
invariant same_underlying()
    underlying() == getUnderlying()


/*
    @Invariant

    @Description:
        With the basic strategy that does nothing, totalUnderlying() value should always equal 
        sum of the vault and strategy's balances of the underlying token
*/
invariant totalUnderlying_correct()
    totalUnderlying() == underlying.balanceOf(currentContract) + underlying.balanceOf(strategy)
    

/*
    @Invariant

    @Description:
        With the basic strategy that does nothing, 
        the totalUnderlyingMinusSponsored() value should always equal totalPrincipal

    TODO - investigate violations in
           https://prover.certora.com/output/15154/03ef82f0c00d42ecca77?anonymousKey=88fbc6398fa94b31d7dac352bffe21e86f968566
*/
invariant totalUnderlyingMinusSponsored_eq_totalPrincipal(method f)
    totalUnderlyingMinusSponsored() == totalPrincipal()
    {
        preserved with (env e) {
            require accumulatedPerfFee() == 0; // no performance fee
            require claimableYield(e.msg.sender) == 0; // no yield
            if (
                f.selector == deposit((address, uint64, uint256,(uint16, address, bytes)[],string,uint256)).selector
                ||
                f.selector == depositForGroupId(uint256,(address,uint64,uint256,(uint16,address,bytes)[],string,uint256)).selector
                ||
                f.selector == sponsor(address,uint256,uint256,uint256).selector
            ) {
                require e.msg.sender != strategy;
            }

        }
        preserved withdraw(address to, uint256[] ids) with (env e1) {
            require to != currentContract && to != strategy;
            require e1.msg.sender != strategy;
        }
        preserved forceWithdraw(address to, uint256[] ids) with (env e2) {
            require to != currentContract && to != strategy;
            require e2.msg.sender != strategy;
        }
        preserved partialWithdraw(address to, uint256[] ids, uint256[] amounts) with (env e3) {
            require to != currentContract && to != strategy;
            require e3.msg.sender != strategy;
        }
        preserved unsponsor(address to, uint256[] ids) with (env e4) {
            require to != currentContract && to != strategy;
            require e4.msg.sender != strategy;
        }
        preserved partialUnsponsor(address to, uint256[] ids, uint256[] amounts) with (env e5) {
            require to != currentContract && to != strategy;
            require e5.msg.sender != strategy;
        }
    }


/*
    @Invariant

    @Description:
        accumulatedPerfFee should remain 0 if the strategy never makes profit
*/
invariant zero_accumulatedPerfFee_if_not_making_profit()
    accumulatedPerfFee() == 0
    {
        preserved {
            require totalUnderlyingMinusSponsored() <= totalPrincipal();
        }
    }


/*
    @Invariant

    @Description:
        if the strategy never makes profit, any user's claimable yield, claimable shares and perfFee should be 0
*/
invariant zero_yield_if_not_making_profit(address user)
    claimableYield(user) == 0 && claimableShares(user) == 0 && perfFee(user) == 0
    {
        preserved {
            require totalUnderlyingMinusSponsored() <= totalPrincipal();
        }
    }


/*
    @Invariant

    @Description:
        deposit data should be 
*/
invariant integrity_of_deposit_data(uint256 depositId)
    depositAmount(depositId) == 0 && 
    depositOwner(depositId) == 0 && 
    depositClaimer(depositId) == 0 && 
    depositLockedUntil(depositId) == 0
    ||
    depositAmount(depositId) != 0 && 
    depositOwner(depositId) != 0 && 
    depositClaimer(depositId) != 0 && 
    depositLockedUntil(depositId) != 0
    {
        preserved {
            require minLockPeriod() > 0;
        }
    }


/*
    @Rule

    @Category: variable transition

    @Description:
        deposit function should update state variables correctly and consistently
*/
rule integrity_of_deposit() {
    address inputToken; 
    uint64 lockDuration;
    uint256 amount; 
    uint16[] pcts;
    address[] claimers;
    bytes[] datas;
    uint256 slippage;
    env e;

    uint256 _userBalance = underlying.balanceOf(e.msg.sender);
    uint256 _vaultBalance = underlying.balanceOf(currentContract);
    uint256 _totalShares = totalShares();
    uint256 _totalPrincipal = totalPrincipal();
    uint256 _totalSharesOfClaimers = totalSharesOf(claimers);
    uint256 _totalPrincipalOfClaimers = totalPrincipalOf(claimers);

    deposit(e, inputToken, lockDuration, amount, pcts, claimers, datas, slippage);

    uint256 userBalance_ = underlying.balanceOf(e.msg.sender);
    uint256 vaultBalance_ = underlying.balanceOf(currentContract);
    uint256 totalShares_ = totalShares();
    uint256 totalPrincipal_ = totalPrincipal();
    uint256 totalSharesOfClaimers_ = totalSharesOf(claimers);
    uint256 totalPrincipalOfClaimers_ = totalPrincipalOf(claimers);

    assert _userBalance - userBalance_ == amount;
    assert vaultBalance_ - _vaultBalance == amount;
    assert totalPrincipal_ - _totalPrincipal == amount;
    assert totalPrincipalOfClaimers_ - _totalPrincipalOfClaimers == amount;
    assert totalShares_ - _totalShares == totalSharesOfClaimers_ - _totalPrincipalOfClaimers;
}


/*
    @Rule

    @Category: variable transition

    @Description:
        deposit and depositForGroupId should have the same effect on balances, shares and principal
*/
rule equivalence_of_deposit_and_depositForGroupId() {
    address inputToken; 
    uint64 lockDuration;
    uint256 amount; 
    uint16[] pcts;
    address[] claimers;
    bytes[] datas;
    uint256 slippage;
    env e1;

    storage init = lastStorage;
    deposit(e1, inputToken, lockDuration, amount, pcts, claimers, datas, slippage);
    uint256 userBalance_deposit = underlying.balanceOf(e1.msg.sender);
    uint256 vaultBalance_deposit = underlying.balanceOf(currentContract);
    uint256 totalShares_deposit = totalShares();
    uint256 totalPrincipal_deposit = totalPrincipal();
    uint256 totalSharesOfClaimers_deposit = totalSharesOf(claimers);
    uint256 totalPrincipalOfClaimers_deposit = totalPrincipalOf(claimers);

    uint256 groupId;
    env e2;
    require e2.msg.sender == e1.msg.sender;
    depositForGroupId(e2, groupId, inputToken, lockDuration, amount, pcts, claimers, datas, slippage) at init;
    uint256 userBalance_depositForGroupId = underlying.balanceOf(e2.msg.sender);
    uint256 vaultBalance_depositForGroupId = underlying.balanceOf(currentContract);
    uint256 totalShares_depositForGroupId = totalShares();
    uint256 totalPrincipal_depositForGroupId = totalPrincipal();
    uint256 totalSharesOfClaimers_depositForGroupId = totalSharesOf(claimers);
    uint256 totalPrincipalOfClaimers_depositForGroupId = totalPrincipalOf(claimers);

    assert userBalance_deposit == userBalance_depositForGroupId;
    assert vaultBalance_deposit == vaultBalance_depositForGroupId;
    assert totalShares_deposit == totalShares_depositForGroupId;
    assert totalPrincipal_deposit == totalPrincipal_depositForGroupId;
    assert totalSharesOfClaimers_deposit == totalSharesOfClaimers_depositForGroupId;
    assert totalPrincipalOfClaimers_deposit == totalPrincipalOfClaimers_depositForGroupId;
}


/*
    @Rule

    @Category: variable transition

    @Description:
        deposit function should update state variables correctly and consistently
*/
rule integrity_of_withdraw() {
    address to;
    uint256[] depositIds;
    env e;

    uint256 _userBalance = underlying.balanceOf(to);
    uint256 _vaultBalance = underlying.balanceOf(currentContract);
    uint256 _totalShares = totalShares();
    uint256 _totalPrincipal = totalPrincipal();
    uint256 _totalDeposits = totalDeposits(depositIds);
    uint256 _totalSharesOfClaimers = totalSharesOf(depositIds);
    uint256 _totalPrincipalOfClaimers = totalPrincipalOf(depositIds);

    withdraw(e, to, depositIds);

    uint256 userBalance_ = underlying.balanceOf(to);
    uint256 vaultBalance_ = underlying.balanceOf(currentContract);
    uint256 totalShares_ = totalShares();
    uint256 totalPrincipal_ = totalPrincipal();
    uint256 totalDeposits_ = totalDeposits(depositIds);
    uint256 totalSharesOfClaimers_ = totalSharesOf(depositIds);
    uint256 totalPrincipalOfClaimers_ = totalPrincipalOf(depositIds);

    assert userBalance_ - _userBalance == _totalDeposits;
    assert _vaultBalance - vaultBalance_ == _totalDeposits;
    assert _totalPrincipal - totalPrincipal_ == _totalDeposits;
    assert _totalShares - totalShares_ == _totalSharesOfClaimers - totalSharesOfClaimers_;
    assert _totalPrincipalOfClaimers == _totalDeposits;
    assert totalPrincipalOfClaimers_ == totalDeposits_;
    assert totalDeposits_ == 0;
}


/*
    @Rule

    @Category: unit test

    @Description:
        maxInvestableAmount equals investPct of totalUnderlying()
*/
rule maxInvestableAmount_correct() {
    assert pctOf(totalUnderlying(), investPct()) == maxInvestableAmount();
}

/*
    @Rule

    @Category: unit test

    @Description:
        yield related calculations are correct

    TODO - investigate violations in
           https://prover.certora.com/output/15154/a439221a2ccf68065c8a?anonymousKey=e13c312d220aa0b0043efc4bd649ce2e11315c1b
           It looks due to uint arithmetic rounding
*/
rule yield_calculations_correct(address user) {
    // should be replaced with 
    // requireInvariant individual_shares_principal_le_total(user);
    // once the invariant is proved
    require sharesOf(user) <= totalShares() && principalOf(user) <= totalPrincipal();

    uint256 claimableYield = claimableYield(user);
    uint256 claimableShares = claimableShares(user);
    uint256 perfFee = perfFee(user);
    uint256 yield = claimableYield + perfFee;
    assert yield > 0 <=> claimableShares > 0;
    assert yield == 0 <=> claimableShares == 0;
    assert perfFee == pctOf(yield, perfFeePct());
}


/*
    @Rule

    @Category: unit test

    @Description:
        the totalUnderlyingMinusSponsored() value should equal totalUnderlying() minus totalSponsored and accumulatedPerfFee  
*/
rule totalUnderlyingMinusSponsored_correct() {
    require totalSponsored() + accumulatedPerfFee() <= totalUnderlying();
    assert totalUnderlyingMinusSponsored() == totalUnderlying() - totalSponsored() - accumulatedPerfFee();
}