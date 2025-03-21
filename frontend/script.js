const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "uint256", "name": "id", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "sender", "type": "address"},
            {"indexed": false, "internalType": "string", "name": "feedback", "type": "string"}
        ],
        "name": "FeedbackCreated",
        "type": "event"
    },
    {
        "inputs": [{"internalType": "string", "name": "feedback", "type": "string"}],
        "name": "createFeedback",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}],
        "name": "getFeedback",
        "outputs": [
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_topic", "type": "string"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "getResults",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "topic",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bool", "name": "_vote", "type": "bool"}],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const contractAddress = "0x3E88C8c697cd076e287e9DA8eAa7F731E413C1a6";

let web3;
let contract;
let accounts;

async function init() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            contract = new web3.eth.Contract(contractABI, contractAddress);
            document.getElementById('status').innerText = `Connected to blockchain: ${accounts[0].slice(0, 6)}...`;
            await loadTopic();
            await updateResults();
        } catch (error) {
            document.getElementById('status').innerText = 'Failed to connect to blockchain.';
            console.error('Initialization error:', error);
        }
    } else {
        document.getElementById('status').innerText = 'Please install MetaMask!';
    }
}

async function loadTopic() {
    try {
        const topic = await contract.methods.topic().call();
        document.getElementById('topic').innerText = topic;
    } catch (error) {
        console.error('Error loading topic:', error);
        document.getElementById('topic').innerText = 'Error loading topic';
    }
}

async function vote(choice) {
    const voteValue = choice === 'yes';
    try {
        const tx = await contract.methods.vote(voteValue).send({ from: accounts[0] });
        document.getElementById('status').innerText = 'Vote recorded successfully!';
        const txLink = document.getElementById('txLink');
        txLink.href = `https://etherscan.io/tx/${tx.transactionHash}`;
        txLink.style.display = 'block';
        await updateResults();
    } catch (error) {
        console.error('Voting failed:', error);
        document.getElementById('status').innerText = 'Voting failed. Check console.';
    }
}

async function updateResults() {
    try {
        const [yesVotes, noVotes] = await contract.methods.getResults().call();
        const total = Number(yesVotes) + Number(noVotes) || 1; // Avoid division by zero
        const yesPercent = (yesVotes / total) * 100;
        const noPercent = (noVotes / total) * 100;

        document.getElementById('yesCount').innerText = `Yes: ${yesVotes}`;
        document.getElementById('noCount').innerText = `No: ${noVotes}`;
        document.getElementById('yesBar').style.width = `${yesPercent}%`;
        document.getElementById('noBar').style.width = `${noPercent}%`;
    } catch (error) {
        console.error('Error updating results:', error);
        document.getElementById('status').innerText = 'Failed to fetch results.';
    }
}

async function submitFeedback() {
    const feedback = document.getElementById('feedbackInput').value;
    if (!feedback) {
        document.getElementById('status').innerText = 'Please enter feedback.';
        return;
    }
    try {
        const tx = await contract.methods.createFeedback(feedback).send({ from: accounts[0] });
        document.getElementById('status').innerText = 'Feedback submitted successfully!';
        const txLink = document.getElementById('txLink');
        txLink.href = `https://etherscan.io/tx/${tx.transactionHash}`;
        txLink.style.display = 'block';
        document.getElementById('feedbackInput').value = ''; // Clear input
    } catch (error) {
        console.error('Feedback submission failed:', error);
        document.getElementById('status').innerText = 'Feedback submission failed.';
    }
}

window.onload = init;