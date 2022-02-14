import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber, utils, constants, ContractFactory } from "ethers";
import type {
  Vault,
  NonUSTStrategy,
  MockEthAnchorRouter,
  MockCurvePool,
  MockERC20,
  MockChainlinkPriceFeed,
} from "../../typechain";
import { generateNewAddress } from "../shared/";

describe("NonUSTStrategy", () => {
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let manager: SignerWithAddress;
  let vault: Vault;
  let strategy: NonUSTStrategy;
  let mockEthAnchorRouter: MockEthAnchorRouter;
  let mockAUstUstFeed: MockChainlinkPriceFeed;
  let mockCurvePool: MockCurvePool;
  let ustToken: MockERC20;
  let aUstToken: MockERC20;
  let underlying: MockERC20;
  let ustFeed: MockChainlinkPriceFeed;
  let underlyingFeed: MockChainlinkPriceFeed;
  const UST_TO_UNDERLYING_RATE = utils.parseUnits("1", 30);
  const UNDERLYING_TO_UST_RATE = utils.parseUnits("0.99", 6);
  const underlyingI = 2;
  const ustI = 0;
  const TREASURY = generateNewAddress();
  const AUST_FEED_DECIMALS = utils.parseEther("1");
  const CURVE_DECIMALS = utils.parseEther("1");
  const PERFORMANCE_FEE_PCT = BigNumber.from("200");
  const INVEST_PCT = BigNumber.from("9000");
  const DENOMINATOR = BigNumber.from("10000");

  const MANAGER_ROLE = utils.keccak256(utils.toUtf8Bytes("MANAGER_ROLE"));

  beforeEach(async () => {
    [owner, alice, manager] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    ustToken = (await MockERC20.deploy(
      utils.parseEther("1000000000")
    )) as MockERC20;
    aUstToken = (await MockERC20.deploy(
      utils.parseEther("1000000000")
    )) as MockERC20;
    underlying = (await MockERC20.deploy(
      utils.parseEther("1000000000")
    )) as MockERC20;
    await underlying.updateDecimals(6);

    const MockChainlinkPriceFeedFactory = await ethers.getContractFactory(
      "MockChainlinkPriceFeed"
    );
    ustFeed = (await MockChainlinkPriceFeedFactory.deploy(
      8
    )) as MockChainlinkPriceFeed;
    underlyingFeed = (await MockChainlinkPriceFeedFactory.deploy(
      8
    )) as MockChainlinkPriceFeed;
    mockAUstUstFeed = (await MockChainlinkPriceFeedFactory.deploy(
      18
    )) as MockChainlinkPriceFeed;

    const MockCurvePoolFactory = await ethers.getContractFactory(
      "MockCurvePool"
    );
    mockCurvePool = (await MockCurvePoolFactory.deploy()) as MockCurvePool;
    await mockCurvePool.addToken(ustI, ustToken.address);
    await mockCurvePool.addToken(underlyingI, underlying.address);
    await ustToken.transfer(mockCurvePool.address, utils.parseEther("1000000"));
    await underlying.transfer(
      mockCurvePool.address,
      utils.parseEther("1000000")
    );
    await mockCurvePool.updateRate(ustI, underlyingI, UST_TO_UNDERLYING_RATE);
    await mockCurvePool.updateRate(underlyingI, ustI, UNDERLYING_TO_UST_RATE);

    await ustFeed.setLatestRoundData(1, utils.parseUnits("1", 8), 100, 100, 1);
    await underlyingFeed.setLatestRoundData(
      1,
      utils.parseUnits("1", 8),
      100,
      100,
      1
    );

    const MockEthAnchorRouterFactory = await ethers.getContractFactory(
      "MockEthAnchorRouter"
    );
    mockEthAnchorRouter = (await MockEthAnchorRouterFactory.deploy(
      ustToken.address,
      aUstToken.address
    )) as MockEthAnchorRouter;

    const VaultFactory = await ethers.getContractFactory("Vault");
    vault = (await VaultFactory.deploy(
      underlying.address,
      0,
      INVEST_PCT,
      owner.address
    )) as Vault;

    const NonUSTStrategyFactory = await ethers.getContractFactory(
      "NonUSTStrategy"
    );

    strategy = (await NonUSTStrategyFactory.deploy(
      vault.address,
      TREASURY,
      mockEthAnchorRouter.address,
      mockAUstUstFeed.address,
      ustToken.address,
      aUstToken.address,
      PERFORMANCE_FEE_PCT,
      owner.address,
      mockCurvePool.address,
      underlyingI,
      ustI
    )) as NonUSTStrategy;

    await strategy.connect(owner).grantRole(MANAGER_ROLE, manager.address);

    await vault.setStrategy(strategy.address);
    await underlying
      .connect(owner)
      .approve(vault.address, constants.MaxUint256);
    await aUstToken
      .connect(owner)
      .approve(mockEthAnchorRouter.address, constants.MaxUint256);
    await ustToken
      .connect(owner)
      .approve(mockEthAnchorRouter.address, constants.MaxUint256);
  });

  describe("constructor", () => {
    let NonUSTStrategyFactory: ContractFactory;

    beforeEach(async () => {
      NonUSTStrategyFactory = await ethers.getContractFactory("NonUSTStrategy");
    });

    it("Revert if curve pool is address(0)", async () => {
      await expect(
        NonUSTStrategyFactory.deploy(
          vault.address,
          TREASURY,
          mockEthAnchorRouter.address,
          mockAUstUstFeed.address,
          ustToken.address,
          aUstToken.address,
          PERFORMANCE_FEE_PCT,
          owner.address,
          constants.AddressZero,
          underlyingI,
          ustI
        )
      ).to.be.revertedWith("NonUSTStrategy: curve pool is 0x");
    });

    it("Revert if underlying is ustToken", async () => {
      const VaultFactory = await ethers.getContractFactory("Vault");
      vault = (await VaultFactory.deploy(
        ustToken.address,
        0,
        INVEST_PCT,
        owner.address
      )) as Vault;

      await expect(
        NonUSTStrategyFactory.deploy(
          vault.address,
          TREASURY,
          mockEthAnchorRouter.address,
          mockAUstUstFeed.address,
          ustToken.address,
          aUstToken.address,
          PERFORMANCE_FEE_PCT,
          owner.address,
          mockCurvePool.address,
          underlyingI,
          ustI
        )
      ).to.be.revertedWith("NonUSTStrategy: invalid underlying");
    });

    it("Check initial values", async () => {
      expect(await strategy.treasury()).to.be.equal(TREASURY);
      expect(await strategy.vault()).to.be.equal(vault.address);
      expect(await strategy.underlying()).to.be.equal(underlying.address);
      expect(await strategy.ethAnchorRouter()).to.be.equal(
        mockEthAnchorRouter.address
      );
      expect(await strategy.aUstToUstFeed()).to.be.equal(
        mockAUstUstFeed.address
      );
      expect(await strategy.ustToken()).to.be.equal(ustToken.address);
      expect(await strategy.aUstToken()).to.be.equal(aUstToken.address);
      expect(await strategy.perfFeePct()).to.be.equal(PERFORMANCE_FEE_PCT);
      expect(await strategy.curvePool()).to.be.equal(mockCurvePool.address);
      expect(await strategy.underlyingI()).to.be.equal(underlyingI);
      expect(await strategy.ustI()).to.be.equal(ustI);
    });
  });

  describe("#initializeStrategy function", () => {
    it("Revert if msg.sender is not admin", async () => {
      await expect(
        strategy
          .connect(alice)
          .initializeStrategy(ustFeed.address, underlyingFeed.address)
      ).to.be.revertedWith("BaseStrategy: caller is not admin");
    });

    it("Initialize by admin", async () => {
      const tx = await strategy
        .connect(owner)
        .initializeStrategy(ustFeed.address, underlyingFeed.address);

      expect(await strategy.ustFeed()).to.be.equal(ustFeed.address);
      expect(await strategy.underlyingFeed()).to.be.equal(
        underlyingFeed.address
      );
      expect(await strategy.initialized()).to.be.equal(true);

      await expect(tx).to.emit(strategy, "Initialized");
    });

    it("Revert if already initialized", async () => {
      await initializeStrategy();

      await expect(
        strategy
          .connect(owner)
          .initializeStrategy(ustFeed.address, underlyingFeed.address)
      ).to.be.revertedWith("NonUSTStrategy: already initialized");
    });
  });

  describe("#doHardWork function", () => {
    it("Revert if not initialized", async () => {
      await expect(strategy.connect(manager).doHardWork()).to.be.revertedWith(
        "NonUSTStrategy: not initialized"
      );
    });

    it("Revert if msg.sender is not manager", async () => {
      await initializeStrategy();

      await expect(strategy.connect(alice).doHardWork()).to.be.revertedWith(
        "BaseStrategy: caller is not manager"
      );
    });

    it("Revert if underlying balance is 0", async () => {
      await initializeStrategy();

      await expect(strategy.connect(manager).doHardWork()).to.be.revertedWith(
        "NonUSTStrategy: no underlying exist"
      );
    });

    it("Should swap underlying to UST and init deposit all UST", async () => {
      await initializeStrategy();

      const operator = await registerNewTestOperator();

      let underlyingAmount = utils.parseUnits("100", 6);
      await depositVault(underlyingAmount);

      expect(await vault.totalUnderlying()).equal(underlyingAmount);
      let investAmount = underlyingAmount.mul(INVEST_PCT).div(DENOMINATOR);
      let ustAmount = investAmount
        .mul(CURVE_DECIMALS)
        .div(UNDERLYING_TO_UST_RATE);

      const tx = await vault.updateInvested();

      expect(await underlying.balanceOf(strategy.address)).equal(0);
      expect(await strategy.convertedUst()).equal(0);
      expect(await strategy.pendingDeposits()).equal(ustAmount);
      expect(await strategy.investedAssets()).equal(
        ustAmount.div(utils.parseUnits("1", 12))
      );
      expect(await vault.totalUnderlying()).equal(
        ustAmount
          .div(utils.parseUnits("1", 12))
          .add(underlyingAmount.sub(investAmount))
      );
      const operation = await strategy.depositOperations(0);
      expect(operation.operator).equal(operator);
      expect(operation.amount).equal(ustAmount);
      expect(await strategy.depositOperationLength()).equal(1);

      await expect(tx)
        .to.emit(strategy, "InitDepositStable")
        .withArgs(operator, 0, investAmount, ustAmount);
    });
  });

  describe("#finishRedeemStable function", () => {
    let operator0: string;
    let underlyingAmount0: BigNumber;
    let investAmount0: BigNumber;
    let ustAmount0: BigNumber;
    let aUstAmount0: BigNumber;
    let redeemAmount0: BigNumber;

    beforeEach(async () => {
      await initializeStrategy();

      operator0 = await registerNewTestOperator();

      underlyingAmount0 = utils.parseUnits("100", 6);
      investAmount0 = underlyingAmount0.mul(INVEST_PCT).div(DENOMINATOR);

      await depositVault(underlyingAmount0);

      ustAmount0 = investAmount0
        .mul(CURVE_DECIMALS)
        .div(UNDERLYING_TO_UST_RATE);

      aUstAmount0 = utils.parseUnits("80", 18);

      await vault.connect(owner).updateInvested();

      await notifyDepositReturnAmount(operator0, aUstAmount0);
      await strategy.connect(manager).finishDepositStable(0);

      operator0 = await registerNewTestOperator();

      redeemAmount0 = utils.parseUnits("50", 18);
      await strategy.connect(manager).initRedeemStable(redeemAmount0);
    });

    it("Revert if msg.sender is not manager", async () => {
      await expect(
        strategy.connect(alice).finishRedeemStable(0)
      ).to.be.revertedWith("BaseStrategy: caller is not manager");
    });

    it("Revert if idx is out of array", async () => {
      await expect(
        strategy.connect(manager).finishRedeemStable(1)
      ).to.be.revertedWith("BaseStrategy: not running");
    });

    it("Should finish redeem operation and swap UST to underlying", async () => {
      let aUstRate = utils.parseEther("1.1");
      await setAUstRate(aUstRate);

      let redeemedUSTAmount0 = utils.parseUnits("55", 18);
      await notifyRedeemReturnAmount(operator0, redeemedUSTAmount0);
      let redeemedUnderlyingAmount = redeemedUSTAmount0
        .mul(CURVE_DECIMALS)
        .div(UST_TO_UNDERLYING_RATE);

      const tx = await strategy.connect(manager).finishRedeemStable(0);

      expect(await aUstToken.balanceOf(strategy.address)).equal(
        aUstAmount0.sub(redeemAmount0)
      );
      expect(await strategy.pendingRedeems()).equal(0);

      let currentStrategyInvestedInUnderlying = aUstAmount0
        .sub(redeemAmount0)
        .mul(aUstRate)
        .div(AUST_FEED_DECIMALS)
        .div(utils.parseUnits("1", 12));

      expect(await strategy.investedAssets()).equal(
        currentStrategyInvestedInUnderlying
      );
      expect(await underlying.balanceOf(vault.address)).equal(
        redeemedUnderlyingAmount.add(underlyingAmount0).sub(investAmount0)
      );
      expect(await vault.totalUnderlying()).equal(
        currentStrategyInvestedInUnderlying
          .add(redeemedUnderlyingAmount)
          .add(underlyingAmount0)
          .sub(investAmount0)
      );

      expect(await strategy.redeemOperationLength()).equal(0);

      await expect(tx)
        .to.emit(strategy, "FinishRedeemStable")
        .withArgs(
          operator0,
          redeemAmount0,
          redeemedUSTAmount0,
          redeemedUnderlyingAmount
        );
    });
  });

  describe("#_estimateUstAmountInUnderlying function", () => {
    beforeEach(async () => {
      await initializeStrategy();
    });

    it("Revert if UST price is not positive", async () => {
      await ustFeed.setLatestRoundData(1, 0, 100, 100, 1);
      await underlyingFeed.setLatestRoundData(1, 10, 100, 100, 1);

      const amount = utils.parseEther("10000");

      await expect(
        vault.connect(alice).deposit({
          amount,
          claims: [
            {
              pct: 10000,
              beneficiary: alice.address,
              data: "0x",
            },
          ],
          lockedUntil: 0,
        })
      ).to.be.revertedWith("NonUSTStrategy: invalid price");
    });

    it("Revert if underlying price is not positive", async () => {
      await ustFeed.setLatestRoundData(1, 10, 100, 100, 1);
      await underlyingFeed.setLatestRoundData(1, 0, 100, 100, 1);

      const amount = utils.parseEther("10000");

      await expect(
        vault.connect(alice).deposit({
          amount,
          claims: [
            {
              pct: 10000,
              beneficiary: alice.address,
              data: "0x",
            },
          ],
          lockedUntil: 0,
        })
      ).to.be.revertedWith("NonUSTStrategy: invalid price");
    });

    it("Revert if UST feed round id is invalid", async () => {
      await ustFeed.setLatestRoundData(3, 10, 100, 100, 2);
      await underlyingFeed.setLatestRoundData(1, 10, 100, 100, 1);

      const amount = utils.parseEther("10000");

      await expect(
        vault.connect(alice).deposit({
          amount,
          claims: [
            {
              pct: 10000,
              beneficiary: alice.address,
              data: "0x",
            },
          ],
          lockedUntil: 0,
        })
      ).to.be.revertedWith("NonUSTStrategy: invalid price");
    });

    it("Revert if underlying feed round id is invalid", async () => {
      await ustFeed.setLatestRoundData(1, 10, 100, 100, 1);
      await underlyingFeed.setLatestRoundData(3, 10, 100, 100, 2);

      const amount = utils.parseEther("10000");

      await expect(
        vault.connect(alice).deposit({
          amount,
          claims: [
            {
              pct: 10000,
              beneficiary: alice.address,
              data: "0x",
            },
          ],
          lockedUntil: 0,
        })
      ).to.be.revertedWith("NonUSTStrategy: invalid price");
    });

    it("Revert if UST feed updated time is zero", async () => {
      await ustFeed.setLatestRoundData(1, 10, 100, 0, 1);
      await underlyingFeed.setLatestRoundData(1, 10, 100, 100, 1);

      const amount = utils.parseEther("10000");

      await expect(
        vault.connect(alice).deposit({
          amount,
          claims: [
            {
              pct: 10000,
              beneficiary: alice.address,
              data: "0x",
            },
          ],
          lockedUntil: 0,
        })
      ).to.be.revertedWith("NonUSTStrategy: invalid price");
    });

    it("Revert if underlying feed updated time is zero", async () => {
      await ustFeed.setLatestRoundData(1, 10, 100, 100, 1);
      await underlyingFeed.setLatestRoundData(1, 10, 100, 0, 1);

      const amount = utils.parseEther("10000");

      await expect(
        vault.connect(alice).deposit({
          amount,
          claims: [
            {
              pct: 10000,
              beneficiary: alice.address,
              data: "0x",
            },
          ],
          lockedUntil: 0,
        })
      ).to.be.revertedWith("NonUSTStrategy: invalid price");
    });

    it("Calculate correct Underlying amount from UST amount", async () => {
      await registerNewTestOperator();

      let underlyingAmount = utils.parseUnits("100", 6);
      let investAmount = underlyingAmount.mul(INVEST_PCT).div(DENOMINATOR);

      await depositVault(underlyingAmount);

      let ustAmount = investAmount
        .mul(CURVE_DECIMALS)
        .div(UNDERLYING_TO_UST_RATE);

      await vault.connect(owner).updateInvested();

      let remainingInVault = underlyingAmount.sub(investAmount);

      expect(await strategy.investedAssets()).equal(
        ustAmount.div(utils.parseUnits("1", 12))
      );
      expect(await vault.totalUnderlying()).equal(
        ustAmount.div(utils.parseUnits("1", 12)).add(remainingInVault)
      );
    });
  });

  // Test helpers
  const initializeStrategy = async () => {
    await strategy
      .connect(owner)
      .initializeStrategy(ustFeed.address, underlyingFeed.address);
  };

  const registerNewTestOperator = async (): Promise<string> => {
    const operator = generateNewAddress();
    await mockEthAnchorRouter.addPendingOperator(operator);
    return operator;
  };

  const depositVault = async (amount: BigNumber) => {
    await vault.connect(owner).deposit({
      amount,
      claims: [
        {
          pct: DENOMINATOR,
          beneficiary: owner.address,
          data: "0x",
        },
      ],
      lockedUntil: 7777777777,
    });
  };

  const notifyDepositReturnAmount = async (
    operator: string,
    amount: BigNumber
  ) => {
    await mockEthAnchorRouter.notifyDepositResult(operator, amount);
  };

  const notifyRedeemReturnAmount = async (
    operator: string,
    amount: BigNumber
  ) => {
    await mockEthAnchorRouter.notifyRedeemResult(operator, amount);
  };

  const setAUstRate = async (rate: BigNumber) => {
    await mockAUstUstFeed.setLatestRoundData(1, rate, 1000, 1000, 1);
  };
});
