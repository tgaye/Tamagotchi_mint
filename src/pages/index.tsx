import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import { useWhitelist } from '../contexts/WhitelistContext'; // Adjust the import path as necessary
import { useAccount, useSendTransaction } from 'wagmi';
import React from 'react';
import { ethers } from 'ethers';
import { AppProps } from "next/app";
import { useRouter } from 'next/router';
import Web3 from "web3";
import { Contract } from "web3-eth-contract";

interface HomeProps extends AppProps {
	web3: Web3;
	contract: Contract<any>; 
	proofs: string[];
  }

export default function Home({ web3, contract, proofs }: HomeProps) {
	const [isNetworkSwitchHighlighted, setIsNetworkSwitchHighlighted] = useState(false);
	const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);
	const [mintAmount, setMintAmount] = useState(1);
	const { sendTransaction } = useSendTransaction();
	const [mintPrice, setMintPrice] = useState(0.012); // Default price
	const [showGameInfo, setShowGameInfo] = useState(false);
	const [showMenu, setShowMenu] = useState(true);
	const [claimRewardsClicked, setClaimRewardsClicked] = useState(false);
	const { address } = useAccount();
	const { isWhitelisted } = useWhitelist();
	const [userBalance, setUserBalance] = useState(0);
	const [showWhitelistButton, setShowWhitelistButton] = useState(true);
	const [showEarnGotchi, setShowEarnGotchi] = useState(window.innerWidth > 1200);
	const [showHeader, setShowHeader] = useState(window.innerWidth > 600);

	useEffect(() => {
		function handleResize() {
		  setShowEarnGotchi(window.innerWidth > 1200);
		  setShowHeader(window.innerWidth > 600);
		}
	
		window.addEventListener('resize', handleResize);
	
		// Clean up the event listener on component unmount
		return () => window.removeEventListener('resize', handleResize);
	  }, []);
	

  useEffect(() => {
    const fetchWhitelistStatus = async () => {
      // Simulating fetching whitelist status
      const status = await fetchUserWhitelistStatus();
       // Recalculate mint price whenever mint amount or whitelist status changes
    calculatePrice(mintAmount, isWhitelisted);
    };

    fetchWhitelistStatus();
  }, []);

  useEffect(() => {
    // Recalculate mint price whenever mint amount or whitelist status changes
    calculatePrice(mintAmount, isWhitelisted);
  }, [mintAmount, isWhitelisted]);

  // Function to fetch and log the balance
  useEffect(() => {
    if (address) {
      fetchBalance(address);
    }
  }, [address]);

  const router = useRouter();
  const refreshPage = () => {
		router.reload();
	};

	const fetchBalance = async (address: string) => {
	try {
	  const balance = await contract.methods.balanceOf(address).call();
	  setUserBalance(Number(balance)); // Convert BigNumber to Number
	  console.log("Balance of:", balance);
	  // If user is whitelisted and balance is 5 or greater, adjust the conditions
	//   if (balance === 20) {
	// 	console.log("Balance greater than cap");
	// 	setShowWhitelistButton(false); // Hide whitelist button
	// 	setMintPrice(0.012);
	// 	setMintAmount(Math.min(mintAmount, 20)); // Ensure mintAmount does not exceed new max
	//   }
	} catch (error) {
	  console.error('Error fetching balance:', error);
	}
  };

  // Simulated function to fetch user whitelist status
  const fetchUserWhitelistStatus = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Assuming the user is whitelisted for demonstration purposes
      }, 1000);
    });
  };

  const closeAll = () => {
    setIsNetworkSwitchHighlighted(false);
    setIsConnectHighlighted(false);
  };

  const incrementMintAmount = () => {
    setMintAmount((prevAmount) => (prevAmount < 20 ? prevAmount + 1 : prevAmount));
  };

  const decrementMintAmount = () => {
    setMintAmount((prevAmount) => (prevAmount > 1 ? prevAmount - 1 : prevAmount));
  };

  const handleMintAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	const maxMint = isWhitelisted ? 20 : 100;
	let value = Math.max(1, Math.min(maxMint, Number(e.target.value)));
	setMintAmount(value);
  };
  

  const calculatePrice = (amount: number, whitelisted: boolean) => {
	const basePrice = whitelisted ? 0.006 : 0.012; // Adjusted price for whitelisted users
	setMintPrice(+(amount * basePrice).toFixed(3));  
};
  

  const handleMaxClick = () => {
    setMintAmount(isWhitelisted ? 20 : 100);
  };

  const handleMax2Click = () => {
    setMintAmount(isWhitelisted ? 100 : 100);
  };

  const toggleGameInfo = () => {
    setShowGameInfo(!showGameInfo);
  };

  const toggleMenuVisibility = () => {
    setShowMenu(!showMenu);
  };

  const handleClaimRewardsClick = () => {
    setClaimRewardsClicked(true);
    setShowMenu(false); // Hide the menu when claiming rewards
  };

  
  // Add a function to handle the mint button click event
  const handleMintButtonClick = async () => {
    if (!address) {
      console.error("Wallet not connected.");
      return;
    }

    try {
      // Convert the amount to Wei
	  const value = BigInt(web3.utils.toWei((0.012 * mintAmount).toString(), 'ether'));

      // Prepare transaction parameters
      const transactionParameters = {
        from: address,
        to: contract.options.address || '', // Set a default value for to
        value: value,
        data: contract.methods.mintNFT(mintAmount).encodeABI()
      };

      // Sending the transaction
      const tx = await sendTransaction({ ...transactionParameters });

    } catch (error) {
      console.error('Mint transaction error:', error);
    }
};

  const handleWhitelistMintClick = async () => {
    if (!address) {
        console.error("Wallet not connected.");
        return;
    }

    try {
        // Convert the amount to Wei
        const value = web3.utils.toWei((0.006 * mintAmount).toString(), 'ether');

        // Prepare transaction parameters
        const transactionParameters = {
            from: address,
            to: contract.options.address,
            value: value,
            data: contract.methods.whitelistMint(mintAmount, window.whitelistProof).encodeABI(), // Pass window.whitelistProof as the merkleProof parameter
        };

        // Sending the transaction
        const tx = await sendTransaction({ ...transactionParameters });
    } catch (error) {
        console.error('Whitelist mint transaction error:', error);
    }
};


  return (
    <>
      <Head>
        <title>WalletConnect | Next Starter Template</title>
        <meta name="description" content="Generated by create-wc-dapp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
	  <header className={styles.header}>
		<div className={styles.headerContent} onClick={refreshPage}>
		{showEarnGotchi && <h1>Earn $GOTCHI</h1>}
		{showHeader && <h1>ERCtamagotchi</h1>}
		</div>
		<div className={styles.buttons}>
			<div onClick={closeAll} className={`${styles.highlight} ${isNetworkSwitchHighlighted ? styles.highlightSelected : ``}`}>
				<w3m-network-button />
			</div>
			<div onClick={closeAll} className={`${styles.highlight} ${isConnectHighlighted ? styles.highlightSelected : ``}`}>
				<w3m-button />
			</div>
		</div>
	</header>


      <main className={styles.main}>
        <div className={styles.menu}>
          {showMenu && !claimRewardsClicked && (
            <>
              <ul className={styles.menuList}>
                <li>$20 WL MINT</li>
                <li>$40 PUBLIC MINT</li>
                <li>NETWORK: BASE</li>
              </ul>

              <div className={styles.mintSection}>
                <div className={styles.inputSection}>
                  <button onClick={decrementMintAmount} className={styles.mintAdjustButton}>-</button>
                  <input
                    type="number"
                    className={styles.mintInput}
                    value={mintAmount}
                    onChange={handleMintAmountChange}
                    min="1"
                    max={isWhitelisted ? "20" : "100"} // Adjust max value based on whitelist status
                  />
                  <button onClick={incrementMintAmount} className={styles.mintAdjustButton}>+</button>

				</div>
         
				<button onClick={handleMaxClick} className={styles.mintButton2}>Max WL</button>
				  <button onClick={handleMax2Click} className={styles.mintButton2}>Max Public</button>
				  
				<div className={styles.fixedButtonsContainer} style={{ textAlign: 'center', marginTop: '20px' }}>
				{showWhitelistButton && isWhitelisted && (
				<button
					onClick={handleWhitelistMintClick}
					className={styles.fixedButton}
					style={{ fontWeight: '900', background:"lightgreen", width: '200px', height: '50px', padding: '10px', fontSize: '16px', margin: '10px', border: '.5vh solid black' }}
				>
					Whitelist Mint
				</button>
				)}
				<button
					onClick={handleMintButtonClick}
					className={styles.fixedButton}
					style={{ fontWeight: '900', width: '200px', height: '50px', padding: '10px', fontSize: '16px', margin: '10px', border: '.5vh solid black' }}
				>
					Public Mint
				</button>
				</div>
                {mintPrice !== null && <div className={styles.price}>{mintPrice} ETH</div>} {/* Display the calculated price if available */}
              </div>
              <ul className={styles.menuList}>
                <br />
                <li>$GOTCHI will have liquidity added ~24 hours after mint.</li>
                <br />
				<li className={styles.farmingRewards}>Farming rewards for pets will be exponentially higher at the start of the experiment.</li>
              </ul>
            </>
          )}
                   {/* Buttons always visible */}
				   <div className={styles.fixedButtonsContainer} style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={toggleGameInfo}
              className={styles.fixedButton2}
              style={{ width: '200px', height: '50px', padding: '10px', fontSize: '16px', margin: '10px', border: '.5vh solid black' }}
            >
              Game Rules
            </button>
            {!claimRewardsClicked && (
              <button
                onClick={handleClaimRewardsClick}
                className={styles.fixedButton2}
                style={{ width: '200px', height: '50px', padding: '10px', fontSize: '16px', margin: '10px', border: '.5vh solid black' }}
              >
                Claim Rewards
              </button>
            )}
         </div>
		 {claimRewardsClicked && (
			<div style={{ textAlign: 'center' }}>
			<img src="/chao.png" alt="Chao Image" style={{ border: '1vh solid black', width: '30vh', height: '30vh' }} />
			{/* Display the balance from the state */}
			<span style={{ display: 'block', fontWeight: 'bold', color: 'black', marginTop: '10px' }}>
				Balance: {userBalance.toString()} pets
			</span>

			<span style={{ display: 'block', fontWeight: 'bold', color: 'black', marginTop: '10px' }}>
				{/* Calculate and display user balance x 100 for BigInt */}
				{/* {`Balance x 100: ${(userBalance * BigInt(100)).toString()} $gotchi / 6 hours`} */}
			</span>

			<button
            //   onClick={toggleGameInfo}
              className={styles.fixedButton}
              style={{ marginLeft: '120px', fontWeight: '900', backgroundColor: 'lightgreen', width: '200px', height: '50px', padding: '10px', fontSize: '16px', margin: '10px', border: '.5vh solid black' }}
            >
               Claim
            </button>
		</div>
		)}

</div>
<img src="/creature1.png" alt="Creature Icon" className={styles.creatureIcon} />
{showGameInfo && (
      <div className={styles.secondMenu}>
        <h2 className={styles.menuHeader}>Learn About The Game</h2>
        <ul className={styles.menuList}>
          <li>ERC Tamagotchi is a blend of NFTs and tokens into one smart contract.</li>
          <li>Each tamagotchi exists on-chain. Your pet works for you to earn you ERC20 tokens.</li>
          <br />
          <li style={{ fontSize: '4vh' }}>Rules:</li>
		  <ul className={styles.menuList2}>
			<li>✅Your pets can claim tokens each &quot;waiting_period&quot;.</li>
			<li>✅Your pets will evolve to new creatures after 5 claims.</li>
			<li>✅Evolved pets yield 3x tokens for the same &quot;waiting_period&quot;</li>
			<li>✅Each time 10% of pets evolve the &quot;waiting_period&quot; is increased by 6 hours.</li>
			</ul>
        </ul>
      </div>
    )}
  </main>
</>
);
}
