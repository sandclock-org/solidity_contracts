import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { time } from '@openzeppelin/test-helpers';
import { ethers, upgrades } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, utils, constants } from 'ethers';

import {
  Vault,
  MockStabilityPool,
  LiquityStrategy,
  MockERC20,
  LiquityStrategy__factory,
  MockCurveExchange,
  Mock0x,
  ERC20,
} from '../../../typechain';

import { generateNewAddress, getTransactionGasCost } from '../../shared/';
import { depositParams, claimParams } from '../../shared/factories';
import { setBalance } from '../../shared/forkHelpers';
import createVaultHelpers from '../../shared/vault';

const { parseUnits } = ethers.utils;

describe('LiquityStrategy', () => {
  let admin: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let manager: SignerWithAddress;
  let keeper: SignerWithAddress;
  let vault: Vault;
  let stabilityPool: MockStabilityPool;
  let strategy: LiquityStrategy;
  let curveExchange: MockCurveExchange;
  let mock0x: Mock0x;
  let underlying: MockERC20;
  let lqty: MockERC20;

  let LiquityStrategyFactory: LiquityStrategy__factory;

  let addUnderlyingBalance: (
    account: SignerWithAddress,
    amount: string,
  ) => Promise<void>;

  const TREASURY = generateNewAddress();
  const MIN_LOCK_PERIOD = BigNumber.from(time.duration.weeks(2).toNumber());
  const PERFORMANCE_FEE_PCT = BigNumber.from('0');
  const INVEST_PCT = BigNumber.from('10000');
  const INVESTMENT_FEE_PCT = BigNumber.from('0');

  const DEFAULT_ADMIN_ROLE = constants.HashZero;
  const MANAGER_ROLE = utils.keccak256(utils.toUtf8Bytes('MANAGER_ROLE'));
  const KEEPER_ROLE = utils.keccak256(utils.toUtf8Bytes('KEEPER_ROLE'));
  const SETTINGS_ROLE = utils.keccak256(utils.toUtf8Bytes('SETTINGS_ROLE'));

  // address of the '0x' contract performing the token swap
  const SWAP_TARGET = '0xdef1c0ded9bec7f1a1670819833240f027b25eff';

  beforeEach(async () => {
    [admin, alice, bob, manager, keeper] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory('MockERC20');
    underlying = await MockERC20.deploy(
      'LUSD',
      'LUSD',
      18,
      parseUnits('1000000000'),
    );

    lqty = await MockERC20.deploy('LQTY', 'LQTY', 18, parseUnits('1000000000'));

    const StabilityPoolFactory = await ethers.getContractFactory(
      'MockStabilityPool',
    );

    stabilityPool = await StabilityPoolFactory.deploy(
      underlying.address,
      '0x0000000000000000000000000000000000000000',
    );

    const VaultFactory = await ethers.getContractFactory('Vault');

    vault = await VaultFactory.deploy(
      underlying.address,
      MIN_LOCK_PERIOD,
      INVEST_PCT,
      TREASURY,
      admin.address,
      PERFORMANCE_FEE_PCT,
      INVESTMENT_FEE_PCT,
      [],
    );

    const CurveExchange = await ethers.getContractFactory('MockCurveExchange');

    curveExchange = await CurveExchange.deploy();

    LiquityStrategyFactory = await ethers.getContractFactory('LiquityStrategy');

    const strategyProxy = await upgrades.deployProxy(
      LiquityStrategyFactory,
      [
        vault.address,
        admin.address,
        stabilityPool.address,
        lqty.address,
        underlying.address,
        keeper.address,
        0,
        curveExchange.address,
      ],
      {
        kind: 'uups',
      },
    );

    await strategyProxy.deployed();

    strategy = LiquityStrategyFactory.attach(strategyProxy.address);

    await strategy.connect(admin).grantRole(MANAGER_ROLE, manager.address);

    await vault.setStrategy(strategy.address);

    const Mock0x = await ethers.getContractFactory('Mock0x');
    mock0x = await Mock0x.deploy();

    await strategy.allowSwapTarget(mock0x.address);

    await underlying
      .connect(admin)
      .approve(vault.address, constants.MaxUint256);

    ({ addUnderlyingBalance } = createVaultHelpers({
      vault,
      underlying,
    }));
  });

  describe('#initialize', () => {
    it('reverts if admin is address(0)', async () => {
      await expect(
        upgrades.deployProxy(
          LiquityStrategyFactory,
          [
            vault.address,
            constants.AddressZero,
            stabilityPool.address,
            lqty.address,
            underlying.address,
            keeper.address,
            0,
            curveExchange.address,
          ],
          {
            kind: 'uups',
          },
        ),
      ).to.be.revertedWith('StrategyAdminCannotBe0Address');
    });

    it('reverts if stabilityPool is address(0)', async () => {
      await expect(
        upgrades.deployProxy(
          LiquityStrategyFactory,
          [
            vault.address,
            admin.address,
            constants.AddressZero,
            lqty.address,
            underlying.address,
            keeper.address,
            0,
            curveExchange.address,
          ],
          {
            kind: 'uups',
          },
        ),
      ).to.be.revertedWith('StrategyStabilityPoolCannotBe0Address');
    });

    it('reverts if lqty is address(0)', async () => {
      await expect(
        upgrades.deployProxy(
          LiquityStrategyFactory,
          [
            vault.address,
            admin.address,
            stabilityPool.address,
            constants.AddressZero,
            underlying.address,
            keeper.address,
            0,
            curveExchange.address,
          ],
          {
            kind: 'uups',
          },
        ),
      ).to.be.revertedWith('StrategyYieldTokenCannotBe0Address');
    });

    it('reverts if underlying is address(0)', async () => {
      await expect(
        upgrades.deployProxy(
          LiquityStrategyFactory,
          [
            vault.address,
            admin.address,
            stabilityPool.address,
            lqty.address,
            constants.AddressZero,
            keeper.address,
            0,
            curveExchange.address,
          ],
          {
            kind: 'uups',
          },
        ),
      ).to.be.revertedWith('StrategyUnderlyingCannotBe0Address');
    });

    it('reverts if keeper is address(0)', async () => {
      await expect(
        upgrades.deployProxy(
          LiquityStrategyFactory,
          [
            vault.address,
            admin.address,
            stabilityPool.address,
            lqty.address,
            underlying.address,
            constants.AddressZero,
            0,
            curveExchange.address,
          ],
          {
            kind: 'uups',
          },
        ),
      ).to.be.revertedWith('StrategyKeeperCannotBe0Address');
    });

    it('reverts if curveExchange is address(0)', async () => {
      await expect(
        upgrades.deployProxy(
          LiquityStrategyFactory,
          [
            vault.address,
            admin.address,
            stabilityPool.address,
            lqty.address,
            underlying.address,
            keeper.address,
            0,
            constants.AddressZero,
          ],
          {
            kind: 'uups',
          },
        ),
      ).to.be.revertedWith('StrategyCurveExchangeCannotBe0Address');
    });

    it('reverts if vault does not have IVault interface', async () => {
      await expect(
        upgrades.deployProxy(
          LiquityStrategyFactory,
          [
            manager.address,
            admin.address,
            stabilityPool.address,
            lqty.address,
            underlying.address,
            keeper.address,
            0,
            curveExchange.address,
          ],
          {
            kind: 'uups',
          },
        ),
      ).to.be.revertedWith('StrategyNotIVault');
    });

    it('checks initial values', async () => {
      // access control
      expect(await strategy.isSync()).to.be.true;
      expect(await strategy.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be
        .true;
      expect(await strategy.hasRole(KEEPER_ROLE, admin.address)).to.be.true;
      expect(await strategy.hasRole(SETTINGS_ROLE, admin.address)).to.be.true;
      expect(await strategy.hasRole(MANAGER_ROLE, vault.address)).to.be.true;
      expect(await strategy.hasRole(KEEPER_ROLE, keeper.address)).to.be.true;

      // state
      expect(await strategy.vault()).to.eq(vault.address);
      expect(await strategy.stabilityPool()).to.eq(stabilityPool.address);
      expect(await strategy.underlying()).to.eq(underlying.address);
      expect(await strategy.curveExchange()).to.eq(curveExchange.address);

      // functions
      expect(await strategy.hasAssets()).to.be.false;
      expect(
        await underlying.allowance(strategy.address, stabilityPool.address),
      ).to.eq(constants.MaxUint256);
    });
  });

  describe('setMinPrincipalProtectionPct', () => {
    it('changes the percentage of principal to protect', async () => {
      await strategy.setMinPrincipalProtectionPct(5000);

      expect(await strategy.minPrincipalProtectionPct()).to.eq(5000);
    });

    it('allows for percentages above 0', async () => {
      await strategy.setMinPrincipalProtectionPct(12000);

      expect(await strategy.minPrincipalProtectionPct()).to.eq(12000);
    });

    it('allows for a percentage of 0', async () => {
      await strategy.setMinPrincipalProtectionPct(0);

      expect(await strategy.minPrincipalProtectionPct()).to.eq(0);
    });

    it('reverts if caller is not settings', async () => {
      await expect(
        strategy.connect(manager).setMinPrincipalProtectionPct(5000),
      ).to.be.revertedWith('StrategyCallerNotSettings');
    });
  });

  describe('#transferAdminRights', () => {
    it('reverts if caller is not admin', async () => {
      await expect(
        strategy.connect(alice).transferAdminRights(alice.address),
      ).to.be.revertedWith('StrategyCallerNotAdmin');
    });

    it('reverts if new admin is address(0)', async () => {
      await expect(
        strategy.connect(admin).transferAdminRights(constants.AddressZero),
      ).to.be.revertedWith('StrategyAdminCannotBe0Address');
    });

    it('reverts if the new admin is the same as the current one', async () => {
      await expect(
        strategy.connect(admin).transferAdminRights(admin.address),
      ).to.be.revertedWith('StrategyCannotTransferAdminRightsToSelf');
    });

    it('transfers admin role to the new admin account', async () => {
      expect(await strategy.hasRole(DEFAULT_ADMIN_ROLE, alice.address)).to.be
        .false;
      expect(await strategy.hasRole(KEEPER_ROLE, alice.address)).to.be.false;
      expect(await strategy.hasRole(SETTINGS_ROLE, alice.address)).to.be.false;

      await strategy.connect(admin).transferAdminRights(alice.address);

      expect(await strategy.hasRole(DEFAULT_ADMIN_ROLE, alice.address)).to.be
        .true;
      expect(await strategy.hasRole(KEEPER_ROLE, alice.address)).to.be.true;
      expect(await strategy.hasRole(SETTINGS_ROLE, alice.address)).to.be.true;
      expect(await strategy.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be
        .false;
      expect(await strategy.hasRole(KEEPER_ROLE, admin.address)).to.be.false;
      expect(await strategy.hasRole(SETTINGS_ROLE, admin.address)).to.be.false;
    });
  });

  describe('#invest', () => {
    it('reverts if msg.sender is not manager', async () => {
      await expect(strategy.connect(alice).invest()).to.be.revertedWith(
        'StrategyCallerNotManager',
      );
    });

    it('reverts if underlying balance is zero', async () => {
      await expect(strategy.connect(manager).invest()).to.be.revertedWith(
        'StrategyNoUnderlying',
      );
    });

    it('deposits underlying to the stabilityPool', async () => {
      let underlyingAmount = utils.parseUnits('100');
      await depositToVault(admin, underlyingAmount);

      expect(await vault.totalUnderlying()).to.eq(underlyingAmount);
      expect(await strategy.investedAssets()).to.eq(0);
      expect(await strategy.hasAssets()).be.false;

      await vault.connect(admin).updateInvested();

      expect(await underlying.balanceOf(stabilityPool.address)).to.eq(
        underlyingAmount,
      );
      expect(await underlying.balanceOf(strategy.address)).to.eq(0);
      expect(await strategy.investedAssets()).to.eq(underlyingAmount);
      expect(await strategy.hasAssets()).be.true;
      expect(await vault.totalUnderlying()).to.eq(underlyingAmount);
    });

    it('emits a StrategyInvested event', async () => {
      let underlyingAmount = utils.parseUnits('100');
      await depositToVault(admin, underlyingAmount);
      const tx = await vault.connect(admin).updateInvested();
      await expect(tx)
        .to.emit(strategy, 'StrategyInvested')
        .withArgs(underlyingAmount);
    });
  });

  describe('#withdrawToVault', () => {
    it('reverts if msg.sender is not manager', async () => {
      await expect(
        strategy.connect(alice).withdrawToVault(1),
      ).to.be.revertedWith('StrategyCallerNotManager');
    });

    it('reverts if amount is zero', async () => {
      await expect(
        strategy.connect(manager).withdrawToVault(0),
      ).to.be.revertedWith('StrategyAmountZero');
    });

    it('reverts if amount is greater than invested assets', async () => {
      await depositToVault(admin, parseUnits('100'));
      await vault.connect(admin).updateInvested();

      const amountToWithdraw = parseUnits('101');

      await expect(
        strategy.connect(manager).withdrawToVault(amountToWithdraw),
      ).to.be.revertedWith('StrategyNotEnoughShares');
    });

    it('works when amount is less than invested assets', async () => {
      await depositToVault(admin, parseUnits('100'));
      await vault.connect(admin).updateInvested();

      const amountToWithdraw = parseUnits('30');

      await strategy.connect(manager).withdrawToVault(amountToWithdraw);

      expect(await stabilityPool.balances(strategy.address)).to.eq(
        parseUnits('70'),
      );
      expect(await strategy.investedAssets()).to.eq(parseUnits('70'));
      expect(await underlying.balanceOf(vault.address)).to.eq(parseUnits('30'));
    });

    it('works when amount is equal to invested assets', async () => {
      const depositAmount = parseUnits('100');
      await depositToVault(admin, depositAmount);
      await vault.connect(admin).updateInvested();

      await strategy.connect(manager).withdrawToVault(depositAmount);

      expect(await stabilityPool.balances(strategy.address)).to.eq('0');
      expect(await strategy.investedAssets()).to.eq('0');
      expect(await underlying.balanceOf(vault.address)).to.eq(depositAmount);
    });

    it('emits StrategyWithdrawn event', async () => {
      await depositToVault(admin, parseUnits('100'));
      await vault.connect(admin).updateInvested();

      const amountToWithdraw = parseUnits('30');

      let tx = await strategy
        .connect(manager)
        .withdrawToVault(amountToWithdraw);

      await expect(tx)
        .to.emit(strategy, 'StrategyWithdrawn')
        .withArgs(amountToWithdraw);
    });
  });

  describe('#allowSwapTarget', () => {
    it('fails if caller is not settings', async () => {
      await expect(
        strategy.connect(alice).allowSwapTarget(SWAP_TARGET),
      ).to.be.revertedWith('StrategyCallerNotSettings');
    });

    it('fails if swap target is address(0)', async () => {
      await expect(
        strategy.connect(admin).allowSwapTarget(constants.AddressZero),
      ).to.be.revertedWith('StrategySwapTargetCannotBe0Address');
    });

    it('adds an address to allowed swap targets', async () => {
      const swapTarget = alice.address;
      await strategy.connect(admin).allowSwapTarget(swapTarget);

      expect(await strategy.allowedSwapTargets(swapTarget)).to.be.true;
    });

    it('fails if swap target is not allowed', async () => {
      const swapTarget = alice.address;

      await expect(
        strategy.connect(admin).reinvest(swapTarget, 0, [], 0, [], 0),
      ).to.be.revertedWith('StrategySwapTargetNotAllowed');
    });
  });

  describe('#denySwapTarget', () => {
    it('fails if caller is not settings', async () => {
      await expect(
        strategy.connect(alice).denySwapTarget(SWAP_TARGET),
      ).to.be.revertedWith('StrategyCallerNotSettings');
    });

    it('fails if swap target is address(0)', async () => {
      await expect(
        strategy.connect(admin).denySwapTarget(constants.AddressZero),
      ).to.be.revertedWith('StrategySwapTargetCannotBe0Address');
    });

    it('removes an address from allowed swap targets', async () => {
      await strategy.connect(admin).allowSwapTarget(SWAP_TARGET);

      await strategy.connect(admin).denySwapTarget(SWAP_TARGET);

      expect(await strategy.allowedSwapTargets(SWAP_TARGET)).to.be.false;
    });
  });

  describe('#reinvest', () => {
    it('reverts if msg.sender is not keeper', async () => {
      await expect(
        strategy.connect(alice).reinvest(SWAP_TARGET, 0, [], 0, [], 0),
      ).to.be.revertedWith('StrategyCallerNotKeeper');
    });

    it('revert if swapTarget is 0 address', async () => {
      await expect(
        strategy
          .connect(keeper)
          .reinvest(constants.AddressZero, 0, [], 0, [], 0),
      ).to.be.revertedWith('StrategySwapTargetCannotBe0Address');
    });

    it('reverts if eth & lqty rewards balance is zero', async () => {
      await strategy.connect(admin).allowSwapTarget(SWAP_TARGET);

      await expect(
        strategy.connect(keeper).reinvest(SWAP_TARGET, 0, [], 0, [], 0),
      ).to.be.revertedWith('StrategyNothingToReinvest');
    });

    it('protects the principal by reverting when the reinvested amount is not enough to cover the principal', async () => {
      await strategy.setMinPrincipalProtectionPct('11000'); // 110%
      await addUnderlyingBalance(alice, '10000');
      await depositToVault(alice, '10000');
      await vault.updateInvested();

      const ethAmount = parseUnits('2000');
      await setBalance(strategy.address, ethAmount);

      // total underlying > min protected principal
      expect(await vault.totalUnderlying()).to.eq(parseUnits('12000'));

      // amount out min + principal < min protected principal
      const amountOutMin = parseUnits('500').sub(1);

      await expect(
        strategy
          .connect(keeper)
          .reinvest(mock0x.address, 0, [], ethAmount, [], amountOutMin),
      ).to.be.revertedWith('StrategyMinimumPrincipalProtection');
    });

    it('bypasses principal protection when total underlying assets are less than min protected principal', async () => {
      await strategy.setMinPrincipalProtectionPct('12000'); // 120%
      await addUnderlyingBalance(alice, '10000');
      await depositToVault(alice, '10000');
      await vault.updateInvested();

      const ethAmount = parseUnits('1000');
      await setBalance(strategy.address, ethAmount);
      const ethSwapData = getSwapData(
        constants.AddressZero,
        underlying,
        ethAmount,
      );

      // total underlying < min protected principal
      expect(await vault.totalUnderlying()).to.eq(parseUnits('11000'));

      // amount out min + principal < min protected principal
      const amountOutMin = parseUnits('10000');

      await strategy.connect(keeper).reinvest(
        mock0x.address,
        0,
        [],
        ethAmount,
        ethSwapData,
        parseUnits('1000'), // 500LQTY * 2 + 1ETH * 1000
      );

      // assert no funds remain held by the strategy
      expect(await underlying.balanceOf(strategy.address)).to.eq('0');
      expect(await getETHBalance(strategy.address)).to.eq('0');
    });

    it('works when selling and reinvesting all of LQTY and ETH', async () => {
      await underlying.mint(strategy.address, parseUnits('10000'));
      await strategy.connect(manager).invest();

      const lqtyAmount = parseUnits('500');
      await lqty.mint(strategy.address, lqtyAmount);
      await setLqtyToUnderlyingExchageRate(parseUnits('2'));
      const lqtySwapData = getSwapData(lqty, underlying, lqtyAmount);

      const ethAmount = parseUnits('1');
      await setBalance(strategy.address, ethAmount);
      await setEthToUnderlyingExchageRate(parseUnits('1000'));
      const ethSwapData = getSwapData(
        constants.AddressZero,
        underlying,
        ethAmount,
      );

      await strategy.connect(keeper).reinvest(
        mock0x.address,
        lqtyAmount,
        lqtySwapData,
        ethAmount,
        ethSwapData,
        parseUnits('2000'), // 500LQTY * 2 + 1ETH * 1000
      );

      // assert no funds remain held by the strategy
      expect(await underlying.balanceOf(strategy.address)).to.eq('0');
      expect(await lqty.balanceOf(strategy.address)).to.eq('0');
      expect(await getETHBalance(strategy.address)).to.eq('0');

      expect(await strategy.investedAssets()).to.eq(parseUnits('12000'));
    });

    it('works if LQTY + ETH amount sold is enough to protect the principal', async () => {
      await vault.setInvestPct('5000'); // 50%
      await strategy.setMinPrincipalProtectionPct('11000'); // 110%
      await addUnderlyingBalance(alice, '20000');

      const params = depositParams.build({
        amount: parseUnits('20000'),
        inputToken: underlying.address,
        claims: [claimParams.percent(100).to(alice.address).build()],
      });

      await vault.connect(alice).deposit(params);

      await vault.updateInvested();
      expect(await strategy.investedAssets()).to.eq(parseUnits('10000'));

      const lqtyAmount = parseUnits('1300');
      await lqty.mint(strategy.address, lqtyAmount);
      const lqtySwapData = getSwapData(lqty, underlying, lqtyAmount);

      const ethAmount = parseUnits('800');
      await setBalance(strategy.address, ethAmount);

      const ethAmountToReinvest = parseUnits('700');
      const ethSwapData = getSwapData(
        constants.AddressZero,
        underlying,
        ethAmountToReinvest,
      );

      // need to reinvest min 2000
      await strategy.connect(keeper).reinvest(
        mock0x.address,
        lqtyAmount,
        lqtySwapData,
        ethAmountToReinvest,
        ethSwapData,
        parseUnits('2000'), // amountOutMin
      );

      expect(await underlying.balanceOf(strategy.address)).to.eq('0');
      expect(await lqty.balanceOf(strategy.address)).to.eq('0');
      expect(await getETHBalance(strategy.address)).to.eq(parseUnits('100'));
      expect(
        await stabilityPool.getCompoundedLUSDDeposit(strategy.address),
      ).to.be.eq(parseUnits('12000'));
      expect(await strategy.investedAssets()).to.eq(parseUnits('12100'));
    });

    it('fails if LQTY + ETH amount sold is not enough to protect the principal', async () => {
      await vault.setInvestPct('9000'); // 90%
      await strategy.setMinPrincipalProtectionPct('12000'); // 120%
      await addUnderlyingBalance(alice, '10000');

      const params = depositParams.build({
        amount: parseUnits('10000'),
        inputToken: underlying.address,
        claims: [claimParams.percent(100).to(alice.address).build()],
      });

      await vault.connect(alice).deposit(params);

      await vault.updateInvested(); // 9000 invested
      expect(await strategy.investedAssets()).to.eq(parseUnits('9000'));

      const lqtyAmount = parseUnits('1000');
      await lqty.mint(strategy.address, lqtyAmount);
      const lqtySwapData = getSwapData(lqty, underlying, lqtyAmount);

      const ethAmount = parseUnits('2000');
      await setBalance(strategy.address, ethAmount);
      const ethSwapData = getSwapData(
        constants.AddressZero,
        underlying,
        ethAmount,
      );

      // need to reinvest min 2000 to cover the principal
      await expect(
        strategy.connect(keeper).reinvest(
          mock0x.address,
          lqtyAmount,
          lqtySwapData,
          ethAmount,
          ethSwapData,
          parseUnits('1999'), // amountOutMin
        ),
      ).to.be.revertedWith('StrategyMinimumPrincipalProtection');
    });
  });

  describe('#transferYield', () => {
    it('fails if caller is not manager', async () => {
      setBalance(strategy.address, parseUnits('100'));

      await expect(
        strategy.transferYield(admin.address, parseUnits('100')),
      ).to.be.revertedWith('StrategyCallerNotManager');
    });

    it('works when ETH balance is 0', async () => {
      expect(await getETHBalance(strategy.address)).to.eq('0');

      await expect(
        strategy
          .connect(manager)
          .transferYield(admin.address, parseUnits('100')),
      ).not.to.be.reverted;
    });

    it('transfers yield in ETH from the strategy to the user', async () => {
      // add 100 ETH to the strategy
      setBalance(strategy.address, parseUnits('100'));

      const alicesInitialEthBalace = await getETHBalance(alice.address);
      // transfer 100 ETH to alice (1 eth = 1 underlying)
      await strategy
        .connect(manager)
        .transferYield(alice.address, parseUnits('100'));

      expect(await underlying.balanceOf(alice.address)).to.eq(parseUnits('0'));
      expect(await getETHBalance(strategy.address)).to.eq(parseUnits('0'));
      expect(
        (await getETHBalance(alice.address)).sub(alicesInitialEthBalace),
      ).to.eq(parseUnits('100'));
    });

    it('transfers all available ETH to the user when ETH balance < yield amount', async () => {
      // add 90 ETH to the strategy
      setBalance(strategy.address, parseUnits('90'));

      const alicesInitialEthBalace = await getETHBalance(alice.address);
      // try to transfer 100 ETH to alice (1 eth = 1 underlying)
      await strategy
        .connect(manager)
        .transferYield(alice.address, parseUnits('100'));

      expect(await getETHBalance(strategy.address)).to.eq(parseUnits('0'));
      expect(await strategy.investedAssets()).to.eq(parseUnits('0'));
      expect(
        (await getETHBalance(alice.address)).sub(alicesInitialEthBalace),
      ).to.eq(parseUnits('90'));
    });

    it('uses curve exchange LUSD -> USDT && USDT -> WETH to obtain ETH price', async () => {
      // add 1 ETH to the strategy
      setBalance(strategy.address, parseUnits('1'));

      const weth = await strategy.WETH();
      const usdt = await strategy.USDT();
      await curveExchange.setExchageRate(
        underlying.address,
        usdt,
        parseUnits('0.8'), // 1 LUSD = 1.25 USDT
      );
      await curveExchange.setExchageRate(usdt, weth, parseUnits('0.0005')); // 1 WETH = 2000 USDT

      const alicesInitialEthBalace = await getETHBalance(alice.address);
      const amountInUnderlying = parseUnits('2500');
      await strategy
        .connect(manager)
        .transferYield(alice.address, amountInUnderlying);

      expect(await underlying.balanceOf(alice.address)).to.eq(parseUnits('0'));
      expect(await getETHBalance(strategy.address)).to.eq(parseUnits('0'));
      expect(
        (await getETHBalance(alice.address)).sub(alicesInitialEthBalace),
      ).to.eq(parseUnits('1'));
    });

    it('emits StrategyYieldTransferred event with transferred amount in underlying', async () => {
      setBalance(strategy.address, parseUnits('1'));

      const weth = await strategy.WETH();
      const usdt = await strategy.USDT();
      await curveExchange.setExchageRate(
        underlying.address,
        usdt,
        parseUnits('0.8'), // 1 LUSD = 1.25 USDT
      );
      await curveExchange.setExchageRate(usdt, weth, parseUnits('0.0005')); // 1 WETH = 2000 USDT

      const amountInUnderlying = parseUnits('2000');
      const tx = await strategy
        .connect(manager)
        .transferYield(alice.address, amountInUnderlying);

      await expect(tx)
        .to.emit(strategy, 'StrategyYieldTransferred')
        .withArgs(alice.address, amountInUnderlying);
    });

    it('fails if the claimer cannot receive ETH', async () => {
      setBalance(strategy.address, parseUnits('100'));

      await expect(
        strategy
          .connect(manager)
          .transferYield(vault.address, parseUnits('100')),
      ).to.be.revertedWith(`StrategyETHTransferFailed`);
    });

    it('works with pricipal protection set', async () => {
      await addUnderlyingBalance(alice, '100');
      await strategy.setMinPrincipalProtectionPct('11000');

      const params = depositParams.build({
        amount: parseUnits('100'),
        inputToken: underlying.address,
        claims: [
          claimParams.percent(50).to(alice.address).build(),
          claimParams.percent(50).to(bob.address).build(),
        ],
      });

      await vault.connect(alice).deposit(params);

      await vault.updateInvested();

      // add 100 ETH to the strategy
      setBalance(strategy.address, parseUnits('100'));

      // swap 10 ETH for LUSD and reinvest
      const ethToReinvest = parseUnits('10');
      const swapData = getSwapData(
        constants.AddressZero,
        underlying,
        ethToReinvest,
      );

      await strategy.reinvest(
        mock0x.address,
        0,
        [],
        ethToReinvest,
        swapData,
        ethToReinvest,
      );

      const alicesInitialEthBalace = await getETHBalance(alice.address);

      let tx = await vault.connect(alice).claimYield(alice.address);

      expect(await underlying.balanceOf(alice.address)).to.eq(parseUnits('0'));
      expect(await getETHBalance(strategy.address)).to.eq(parseUnits('40'));
      expect(
        (await getETHBalance(alice.address))
          .sub(alicesInitialEthBalace)
          .add(await getTransactionGasCost(tx)), // ignore the gas cost
      ).to.eq(parseUnits('50'));
      expect(await strategy.investedAssets()).to.eq(parseUnits('150'));

      const bobsInitialEthBalace = await getETHBalance(bob.address);

      // bob receives 10 in underlying and 40 in ETH
      tx = await vault.connect(bob).claimYield(bob.address);

      expect(await underlying.balanceOf(bob.address)).to.eq(parseUnits('10'));
      expect(await getETHBalance(strategy.address)).to.eq(parseUnits('0'));
      expect(
        (await getETHBalance(bob.address))
          .sub(bobsInitialEthBalace)
          .add(await getTransactionGasCost(tx)), // ignore the gas cost
      ).to.eq(parseUnits('40'));
      expect(await strategy.investedAssets()).to.eq(parseUnits('100'));
    });
  });

  async function depositToVault(
    user: SignerWithAddress,
    amount: BigNumber | string,
  ) {
    await vault.connect(user).deposit(
      depositParams.build({
        amount: amount instanceof BigNumber ? amount : parseUnits(amount),
        inputToken: underlying.address,
        claims: [claimParams.percent(100).to(user.address).build()],
      }),
    );
  }

  function getETHBalance(account: string) {
    return ethers.provider.getBalance(account);
  }

  function getSwapData(
    from: ERC20 | string,
    to: ERC20 | string,
    amount: BigNumber | string,
  ) {
    const fromAddress = typeof from === 'string' ? from : from.address;
    const toAddress = typeof to === 'string' ? to : to.address;

    return ethers.utils.defaultAbiCoder.encode(
      ['address', 'address', 'uint256'],
      [fromAddress, toAddress, amount],
    );
  }

  async function setEthToUnderlyingExchageRate(
    exchangeRate: BigNumber | string,
  ) {
    await mock0x.setExchageRate(
      constants.AddressZero,
      underlying.address,
      exchangeRate,
    );
    await curveExchange.setExchageRate(
      constants.AddressZero,
      underlying.address,
      exchangeRate,
    );
  }

  async function setLqtyToUnderlyingExchageRate(
    exchangeRate: BigNumber | string,
  ) {
    await mock0x.setExchageRate(lqty.address, underlying.address, exchangeRate);
    await curveExchange.setExchageRate(
      lqty.address,
      underlying.address,
      exchangeRate,
    );
  }
});
