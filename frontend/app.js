
const CONTRACT_ADDRESS = "0x79453ddac8e1dcb4ab26b4293ef9d41d9a945716162ad1dddf6d5651d82ceb60";
const MODULE_NAME = "MultiFactorAuth";
const APTOS_NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";

let currentAccount = null;
let aptosClient = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});
async function initializeApp() {
    console.log('Initializing MFA DApp...');

    if (window.aptos) {
        try {
            const response = await window.aptos.account();
            if (response) {
                currentAccount = response.address;
                updateWalletUI(true);
                await loadUserProfile();
                console.log('Wallet already connected:', currentAccount);
            }
        } catch (error) {
            console.log("Wallet not connected");
        }
    } else {
        console.warn('Aptos wallet not detected. Please install Petra Wallet.');
    }
  
    if (window.AptosClient) {
        aptosClient = new window.AptosClient(APTOS_NODE_URL);
        console.log('Aptos client initialized');
    }
}

/**
 * Setup event listeners for UI elements
 */
function setupEventListeners() {
    // Wallet connection events
    const connectBtn = document.getElementById('connectWallet');
    const disconnectBtn = document.getElementById('disconnectWallet');
    
    if (connectBtn) connectBtn.addEventListener('click', connectWallet);
    if (disconnectBtn) disconnectBtn.addEventListener('click', disconnectWallet);
    
    // MFA registration and verification
    const registerBtn = document.getElementById('registerBtn');
    const verifyBtn = document.getElementById('verifyBtn');
    const refreshBtn = document.getElementById('refreshProfile');
    
    if (registerBtn) registerBtn.addEventListener('click', registerMFA);
    if (verifyBtn) verifyBtn.addEventListener('click', verifyFactor);
    if (refreshBtn) refreshBtn.addEventListener('click', loadUserProfile);
    
    // Form validation on input changes
    document.addEventListener('change', validateForms);
    document.addEventListener('input', validateForms);
}

/**
 * Connect to Aptos wallet
 */
async function connectWallet() {
    if (!window.aptos) {
        showStatus('Please install Petra Wallet or another Aptos wallet extension', 'error');
        return;
    }

    try {
        showStatus('Connecting wallet...', 'info');
        
        const response = await window.aptos.connect();
        currentAccount = response.address;
        
        console.log('Wallet connected:', currentAccount);
        updateWalletUI(true);
        await loadUserProfile();
        showStatus('Wallet connected successfully!', 'success');
        
    } catch (error) {
        console.error('Wallet connection error:', error);
        showStatus('Failed to connect wallet: ' + error.message, 'error');
    }
}

/**
 * Disconnect from wallet
 */
async function disconnectWallet() {
    try {
        if (window.aptos && window.aptos.disconnect) {
            await window.aptos.disconnect();
        }
        
        currentAccount = null;
        updateWalletUI(false);
        document.getElementById('userProfile').classList.add('hidden');
        showStatus('Wallet disconnected', 'info');
        
        console.log('Wallet disconnected');
        
    } catch (error) {
        console.error('Disconnect error:', error);
        showStatus('Error disconnecting wallet', 'error');
    }
}

/**
 * Update wallet UI based on connection status
 */
function updateWalletUI(connected) {
    const connectSection = document.getElementById('walletStatus');}