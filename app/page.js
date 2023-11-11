"use client"
import {
  REWARD_TOKEN_ADDRESSES,
  STAKE_TOKEN_ADDRESSES,
  STAKE_CONTRACT_ADDRESSES,
  REWARD_TOKEN_ABI,
  STAKE_TOKEN_ABI,
  STAKE_CONTRACT_ABI
} from "../cost/addresses";
import { ethers } from 'ethers';
import { useAccount, useContractRead, useBalance, useContractWrite } from 'wagmi'
import NoSSR from "@/components/noSSR";
import { useEffect, useState } from "react";

export default function Home() {
  const { address } = useAccount()

  const { data: rewardTokenBalance, isLoading: loadingRewardTokenBalance } = useBalance({
    address: address,
    token: REWARD_TOKEN_ADDRESSES
  })

  const { data: stakeTokenBalance, isLoading: loadingStakeTokenBalance } = useBalance({
    address: address,
    token: STAKE_TOKEN_ADDRESSES
  })

  const {
    data: stakeInfo,
    refetch: refetchStakeInfo,
    isLoading: loadingStakeInfo,
  } = useContractRead(
    {
      address: STAKE_CONTRACT_ADDRESSES,
      abi: STAKE_CONTRACT_ABI,
      functionName: 'getStakeInfo',
      args: [address]
    }
  );

  const [stakeAmount, setStakeAmount] = useState("0");
  const [claimAmount, setClaimAmount] = useState("0");
  const [unstakeAmount, setUnstakeAmount] = useState("0");


  useEffect(() => {
    setInterval(() => {
      refetchStakeInfo();
    }, 1000);
  }, []);

  function resetValue() {
    setStakeAmount("0");
    setUnstakeAmount("0");
  }

  const { error: allowenceData, isLoading: allowenceLoading, isSuccess: isAllowed, write: setAllowance } = useContractWrite({
    address: STAKE_TOKEN_ADDRESSES,
    abi: STAKE_TOKEN_ABI,
    functionName: 'approve',
    args: [STAKE_CONTRACT_ADDRESSES, stakeAmount]
  })

  const { data: stakeData, isLoading: stakeLoading, isSuccess: isStaked, write: stake } = useContractWrite({
    address: STAKE_CONTRACT_ADDRESSES,
    abi: STAKE_CONTRACT_ABI,
    functionName: 'stake',
    args: [stakeAmount]
  })

  const { data: unstakeData, isLoading: unstakeLoading, isSuccess: isUnstaked, write: unstake } = useContractWrite({
    address: STAKE_CONTRACT_ADDRESSES,
    abi: STAKE_CONTRACT_ABI,
    functionName: 'withdraw',
    args: [unstakeAmount]
  })

  const { data: claimData, isLoading: claimLoading, isSuccess: isClaimed, write: claim } = useContractWrite({
    address: STAKE_CONTRACT_ADDRESSES,
    abi: STAKE_CONTRACT_ABI,
    functionName: 'withdrawRewardTokens',
  })
  const stakeToken = async () => {
      setAllowance();
      stake({args:[stakeAmount]});
      resetValue();
  } 

  return (
    <NoSSR>
      <>
        {
          address ? (
            <div>
              <div className=" flex justify-around">
                <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                  <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Stake Token</h1>
                  <div>
                    {!loadingStakeTokenBalance ?
                      (
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                          ${stakeTokenBalance?.symbol} {stakeTokenBalance?.formatted}
                        </p>
                      ) : (
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                          loading....
                        </p>
                      )
                    }
                  </div>
                </div>
                <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                  <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Reward Token</h1>
                  <div>
                    {!loadingRewardTokenBalance ?
                      (
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                          ${rewardTokenBalance?.symbol} {rewardTokenBalance?.formatted}
                        </p>
                      ) : (
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                          loading....
                        </p>
                      )
                    }
                  </div>
                </div>
              </div>
              <div>
                <h1 className=" mb-4 font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400 text-center">Earn Reward Token</h1>
                <div className=" flex justify-around">
                  <div>
                    <div>
                      <p className="mb-3 text-gray-500 dark:text-gray-400">
                        Stake Token:
                      </p>
                      <div>
                        {!loadingStakeInfo && !loadingStakeTokenBalance && stakeInfo && stakeInfo[0] ? (
                          <p className="mb-3 text-gray-500 dark:text-gray-400">
                            {ethers.formatEther(stakeInfo[0])}{" $" + stakeTokenBalance?.symbol}
                          </p>
                        ) : (
                          <p>0</p>
                        )}
                      </div>
                    </div>
                    <div className=" flex flex-col gap-3">
                      <div className=" flex items-center justify-between gap-2">
                        <input
                          type="number"
                          max={stakeTokenBalance?.totalSupply?.formatted}
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        <button className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900" onClick={stakeToken}>
                          Stake
                        </button>
                      </div>
                      <div className=" flex items-center justify-between gap-2">
                        <input
                          type="number"
                          value={unstakeAmount}
                          onChange={(e) => setUnstakeAmount(e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        <button className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900" onClick={unstake}>
                          Unstake
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                      <p className="mb-3 text-gray-500 dark:text-gray-400">
                        Reward Token:
                      </p>
                      <div>
                        {!loadingStakeInfo && !loadingRewardTokenBalance && stakeInfo && stakeInfo[0] ? (
                          <div>
                            <p className="mb-3 text-gray-500 dark:text-gray-400">{ethers.formatEther(stakeInfo[1])}{" $" + rewardTokenBalance?.symbol}</p>
                          </div>
                        ) : (
                          <p>0</p>
                        )}
                      </div>
                      <div className=" flex items-center justify-between gap-2">
                        <input
                          type="number"
                          value={claimAmount}
                          onChange={(e) => setClaimAmount(e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        <button className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900" onClick={() => claim({ args: [claimAmount] })}>
                          Claim
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div >
              <h1>Please Connect a Wallet</h1>
            </div>
          )
        }
      </>
    </NoSSR >

  );
};

