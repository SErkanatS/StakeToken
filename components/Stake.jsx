
import {
  button,
  useAddress,
  useContract,
  useContractRead,
  useTokenBalance,
} from "@thirdweb-dev/react";
import {
  REWARD_TOKEN_ADDRESSES,
  STAKE_CONTRACT_ADDRESSES,
  STAKE_TOKEN_ADDRESSES,
} from "../cost/addresses";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function Stake() {
  const address = useAddress();

  const { contract: stakeTokenContract } = useContract(
    STAKE_TOKEN_ADDRESSES,
    "token"
  );
  const { contract: rewardTokenContract } = useContract(
    REWARD_TOKEN_ADDRESSES,
    "token"
  );
  const { contract: stakeContract } = useContract(
    STAKE_CONTRACT_ADDRESSES,
    "custom"
  );

  // const {
  //   data: stakeInfo,
  //   refetch: refetchStakeInfo,
  //   isLoading: loadingStakeInfo,
  // } = useContractRead(stakeContract, "getStakeInfo", [address]);

  const { data: stakeTokenBalance, isLoading: loadingStakeTokenBalance } =
    useTokenBalance(stakeTokenContract, address);

  const { data: rewardTokenBalance, isLoading: loadingRewardTokenBalance } =
    useTokenBalance(rewardTokenContract, address);

  useEffect(() => {
    setInterval(() => {
      refetchStakeInfo();
    }, 10000);
  }, []);

  const [stakeAmount, setStakeAmount] = useState<string>("0");
  const [unstakeAmount, setUnstakeAmount] = useState<string>("0");

  function resetValue() {
    setStakeAmount("0");
    setUnstakeAmount("0");
  }

  const toast = useToast();

  return (
    <div>
      <h1>Earn Reward Token</h1>
      <div>
        <div>
          <div>
            <p>
              Stake Token:
            </p>
            <div isLoaded=''>
              {stakeInfo && stakeInfo[0] ? (
                <p>
                  {ethers.formatEther(stakeInfo[0])}
                  {" $" + stakeTokenBalance?.symbol}
                </p>
              ) : (
                <p>0</p>
              )}
            </div>
          </div>
          <div spacing={4}>
            <div spacing={4}>
              <input
                type="number"
                max={stakeTokenBalance?.displayValue}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <button
                contractAddress={STAKE_CONTRACT_ADDRESSES}
                action={async (contract) => {
                  await stakeTokenContract?.erc20.setAllowance(
                    STAKE_CONTRACT_ADDRESSES,
                    stakeAmount
                  );

                  await contract.call("stake", [
                    ethers.parseEther(stakeAmount),
                  ]);
                  resetValue();
                }}
                onSuccess={() =>
                  toast({
                    title: "Stake Successful",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                  })
                }
              >
                Stake
              </button>
            </div>
            <div spacing={4}>
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
              />
              <button
                contractAddress={STAKE_CONTRACT_ADDRESSES}
                action={async (contract) => {
                  await contract.call("withdraw", [
                    ethers.parseEther(unstakeAmount),
                  ]);
                }}
                onSuccess={() =>
                  toast({
                    title: "Unstake Successful",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                  })
                }
              >
                Unstake
              </button>
            </div>
          </div>
        </div>
        <div>
          <div
            h={"100%"}
            justifyContent={"space-between"}
            direction={"column"}
            pAlign={"center"}
          >
            <p>
              Reward Token:
            </p>
            <div
              isLoaded={!loadingStakeInfo && !loadingRewardTokenBalance}
            >
              {stakeInfo && stakeInfo[0] ? (
                <div>
                  <p>
                    {ethers.formatEther(stakeInfo[1])}
                  </p>
                  <p>{" $" + rewardTokenBalance?.symbol}</p>
                </div>
              ) : (
                <p>0</p>
              )}
            </div>
            <button
              contractAddress={STAKE_CONTRACT_ADDRESSES}
              action={async (contract) => {
                await contract.call("claimRewards");
                resetValue();
              }}
              onSuccess={() =>
                toast({
                  title: "Rewards Claimed",
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                })
              }
            >
              Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
