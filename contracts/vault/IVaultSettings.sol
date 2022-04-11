// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.10;

interface IVaultSettings {
    //
    // Events
    //

    event InvestPctUpdated(uint256 percentage);
    event TreasuryUpdated(address indexed treasury);
    event PerfFeePctUpdated(uint16 pct);
    event StrategyUpdated(address indexed strategy);

    /**
     * Changes the performance fee
     *
     * @param _investPct The new investment fee %
     */
    function setInvestPerc(uint16 _investPct) external;

    /**
     * Changes the treasury used by the vault.
     *
     * @param _treasury the new strategy's address.
     */
    function setTreasury(address _treasury) external;

    /**
     * Changes the performance fee used by the vault.
     *
     * @param _perfFeePct the new performance fee.
     */
    function setPerfFeePct(uint16 _perfFeePct) external;

    /**
     * Changes the strategy used by the vault.
     *
     * @notice if there is invested funds in previous strategy, it is not allowed to set new strategy.
     * @param _strategy the new strategy's address.
     */
    function setStrategy(address _strategy) external;
}
