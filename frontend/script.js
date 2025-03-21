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
            updateStatus(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
            await loadTopic();
            await updateResults();
            startAutoRefresh();
        } catch (error) {
            updateStatus('Connection failed. Check console.');
            console.error('Initialization error:', error);
        }
    } else {
        updateStatus('Please install MetaMask!');
    }
}

async function loadTopic() {
    try {
        const topic = await contract.methods.topic().call();
        const topicElement = document.getElementById('topic');
        topicElement.innerText = topic;
        topicElement.classList.add('animate__fadeIn');
    } catch (error) {
        console.error('Error loading topic:', error);
        document.getElementById('topic').innerText = 'Error loading topic';
    }
}

async function vote(choice) {
    const voteValue = choice === 'yes';
    const button = document.getElementById(`vote${choice === 'yes' ? 'Yes' : 'No'}`);
    button.disabled = true;
    button.style.opacity = '0.7';
    try {
        const tx = await contract.methods.vote(voteValue).send({ from: accounts[0] });
        updateStatus('Vote recorded successfully!');
        showTxLink(tx.transactionHash);
        await updateResults();
        animateVote(choice);
    } catch (error) {
        console.error('Voting failed:', error);
        updateStatus('Voting failed. Check console.');
    } finally {
        button.disabled = false;
        button.style.opacity = '1';
    }
}

async function updateResults() {
    try {
        const [yesVotes, noVotes] = await contract.methods.getResults().call();
        const total = Number(yesVotes) + Number(noVotes) || 1;
        const yesPercent = (yesVotes / total) * 100;
        const noPercent = (noVotes / total) * 100;

        document.getElementById('yesCount').innerText = `Yes: ${yesVotes} (${yesPercent.toFixed(1)}%)`;
        document.getElementById('noCount').innerText = `No: ${noVotes} (${noPercent.toFixed(1)}%)`;
        document.getElementById('yesBar').style.width = `${yesPercent}%`;
        document.getElementById('noBar').style.width = `${noPercent}%`;
    } catch (error) {
        console.error('Error updating results:', error);
        updateStatus('Failed to fetch results.');
    }
}

async function submitFeedback() {
    const feedback = document.getElementById('feedbackInput').value.trim();
    if (!feedback) {
        updateStatus('Please enter feedback.');
        return;
    }
    try {
        const tx = await contract.methods.createFeedback(feedback).send({ from: accounts[0] });
        updateStatus('Feedback submitted successfully!');
        showTxLink(tx.transactionHash);
        document.getElementById('feedbackInput').value = '';
        animateFeedback();
    } catch (error) {
        console.error('Feedback submission failed:', error);
        updateStatus('Feedback submission failed.');
    }
}

function updateStatus(message) {
    const status = document.getElementById('status');
    status.innerText = message;
    status.classList.add('animate__fadeIn');
    setTimeout(() => status.classList.remove('animate__fadeIn'), 1000);
}

function showTxLink(hash) {
    const txLink = document.getElementById('txLink');
    txLink.href = `https://etherscan.io/tx/${hash}`;
    txLink.style.display = 'block';
    txLink.classList.add('animate__fadeIn');
}

function animateVote(choice) {
    const bar = document.getElementById(`${choice}Bar`);
    bar.classList.add('animate__pulse');
    setTimeout(() => bar.classList.remove('animate__pulse'), 500);
}

function animateFeedback() {
    const feedbackSection = document.querySelector('.feedback-section');
    feedbackSection.classList.add('animate__tada');
    setTimeout(() => feedbackSection.classList.remove('animate__tada'), 1000);
}

function startAutoRefresh() {
    setInterval(updateResults, 30000); // Refresh every 30 seconds
}

window.onload = init;
