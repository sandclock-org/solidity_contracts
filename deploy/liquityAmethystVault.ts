import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import type { DeployFunction } from 'hardhat-deploy/types';

import { includes } from 'lodash';

import { getCurrentNetworkConfig } from '../scripts/deployConfigs';
import deployMockCurvePool from './helpers/mockPool';
import verify, { verifyContracts } from './helpers/verify';

const func: DeployFunction = async function (env: HardhatRuntimeEnvironment) {
  const { deployer } = await env.getNamedAccounts();
  const { deploy, get, getNetworkName } = env.deployments;

  const lusd = await get('LUSD');
  const dai = await get('DAI');
  const usdc = await get('USDC');

  if (getNetworkName() === 'goerli') {
    await verifyContracts(env, [lusd, dai, usdc]);
  }

  if (getNetworkName() !== 'mainnet') {
    await deployMockCurvePool(env, 'CurvePool-LUSD-3CRV', 'LUSD', [
      'DAI',
      'USDC',
    ]);
  }

  const curvePool = await get('CurvePool-LUSD-3CRV');

  const {
    minLockPeriod,
    investPct,
    perfFeePct,
    lossTolerancePct,
    multisig,
    deploymentAddress,
  } = await getCurrentNetworkConfig();
  const treasury = multisig;
  const owner = deploymentAddress;

  const args = [
    lusd.address,
    minLockPeriod,
    investPct,
    treasury,
    owner,
    perfFeePct,
    lossTolerancePct,
    [
      {
        token: dai.address,
        pool: curvePool.address,
        tokenI: 1,
        underlyingI: 0,
      },
      {
        token: usdc.address,
        pool: curvePool.address,
        tokenI: 2,
        underlyingI: 0,
      },
    ],
    0,
  ];

  const vaultDeployment = await deploy('Liquity_Amethyst_Vault', {
    contract: 'Vault',
    from: deployer,
    log: true,
    args,
  });

  if (getNetworkName() !== 'hardhat' && getNetworkName() !== 'docker') {
    await verify(env, {
      address: vaultDeployment.address,
      constructorArguments: args,
    });

    await env.tenderly.persistArtifacts({
      name: 'Liquity_Amethyst_Vault',
      address: vaultDeployment.address,
    });
  }
};

func.skip = async (env: HardhatRuntimeEnvironment) =>
  !includes(
    ['goerli', 'docker', 'mainnet', 'hardhat'],
    env.deployments.getNetworkName(),
  );

func.tags = ['vault', 'liquity_amethyst', 'liquity_amethyst_vault'];
func.dependencies = ['dev'];

export default func;
