// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    // Struct to store voter details
    struct Voter {
        bool hasVoted;
        uint256 vote; // Index of the option they voted for
    }

    // Struct to store proposal details
    struct Proposal {
        string title;
        uint256 voteCount;
    }

    // State variables
    address public admin;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    bool public votingOpen;

    // Events
    event VoterRegistered(address voter);
    event VoteCasted(address voter, uint256 proposalIndex);
    event VotingStarted();
    event VotingEnded();

    // Modifier to restrict access to admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Modifier to check if voting is open
    modifier votingIsOpen() {
        require(votingOpen, "Voting is not open");
        _;
    }

    // Constructor to initialize admin and proposals
    constructor(string[] memory proposalTitles) {
        admin = msg.sender;
        votingOpen = false;
        for (uint256 i = 0; i < proposalTitles.length; i++) {
            proposals.push(Proposal({
                title: proposalTitles[i],
                voteCount: 0
            }));
        }
    }

    // Start voting process
    function startVoting() external onlyAdmin {
        require(!votingOpen, "Voting is already open");
        votingOpen = true;
        emit VotingStarted();
    }

    // End voting process
    function endVoting() external onlyAdmin {
        require(votingOpen, "Voting is already closed");
        votingOpen = false;
        emit VotingEnded();
    }

    // Register a voter (only admin can register)
    function registerVoter(address voter) external onlyAdmin {
        require(!voters[voter].hasVoted, "Voter has already voted");
        voters[voter] = Voter({
            hasVoted: false,
            vote: 0
        });
        emit VoterRegistered(voter);
    }

    // Cast a vote
    function vote(uint256 proposalIndex) external votingIsOpen {
        Voter storage sender = voters[msg.sender];
        require(!sender.hasVoted, "You have already voted");
        require(proposalIndex < proposals.length, "Invalid proposal index");

        sender.hasVoted = true;
        sender.vote = proposalIndex;
        proposals[proposalIndex].voteCount += 1;

        emit VoteCasted(msg.sender, proposalIndex);
    }

    // Get the winning proposal
    function getWinningProposal() external view returns (string memory title, uint256 voteCount) {
        require(!votingOpen, "Voting is still open");
        uint256 winningVoteCount = 0;
        uint256 winningProposalIndex = 0;

        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalIndex = i;
            }
        }
        return (proposals[winningProposalIndex].title, winningVoteCount);
    }

    // Get total number of proposals
    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }

    // Get proposal details by index
    function getProposal(uint256 index) external view returns (string memory title, uint256 voteCount) {
        require(index < proposals.length, "Invalid proposal index");
        return (proposals[index].title, proposals[index].voteCount);
    }
}