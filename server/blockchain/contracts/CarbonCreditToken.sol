// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CarbonCreditToken
 * @dev ERC20 token for carbon credits from rice cultivation
 */
contract CarbonCreditToken is ERC20, Ownable, Pausable {
    
    uint8 private constant DECIMALS = 2;
    
    enum VerificationStatus { Pending, Verified, Rejected }
    
    struct Project {
        string projectId;
        address farmerAddress;
        uint256 landArea;
        uint256 carbonCredits;
        uint256 verifiedAt;
        VerificationStatus status;
        string dataHash;
        bool tokensMinted;
    }
    
    struct Farmer {
        string aadharNumber;
        string farmerName;
        uint256 totalProjects;
        uint256 totalCredits;
        bool isRegistered;
    }
    
    mapping(string => Project) public projects;
    mapping(address => Farmer) public farmers;
    mapping(address => string[]) public farmerProjects;
    
    string[] public allProjectIds;
    address[] public allFarmers;
    
    event ProjectRegistered(string indexed projectId, address indexed farmer, uint256 carbonCredits);
    event ProjectVerified(string indexed projectId, address indexed farmer, uint256 carbonCredits);
    event TokensMinted(string indexed projectId, address indexed farmer, uint256 amount);
    event FarmerRegistered(address indexed farmer, string aadharNumber, string farmerName);
    
    constructor() ERC20("Carbon Credit Token", "CCT") Ownable(msg.sender) {}
    
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
    
    function registerFarmer(
        address _farmerAddress,
        string memory _aadharNumber,
        string memory _farmerName
    ) external onlyOwner {
        require(!farmers[_farmerAddress].isRegistered, "Farmer already registered");
        require(_farmerAddress != address(0), "Invalid address");
        
        farmers[_farmerAddress] = Farmer({
            aadharNumber: _aadharNumber,
            farmerName: _farmerName,
            totalProjects: 0,
            totalCredits: 0,
            isRegistered: true
        });
        
        allFarmers.push(_farmerAddress);
        emit FarmerRegistered(_farmerAddress, _aadharNumber, _farmerName);
    }
    
    function registerProject(
        string memory _projectId,
        address _farmerAddress,
        uint256 _landArea,
        uint256 _carbonCredits,
        string memory _dataHash
    ) external onlyOwner {
        require(bytes(projects[_projectId].projectId).length == 0, "Project exists");
        require(farmers[_farmerAddress].isRegistered, "Farmer not registered");
        require(_carbonCredits > 0, "Credits must be > 0");
        
        projects[_projectId] = Project({
            projectId: _projectId,
            farmerAddress: _farmerAddress,
            landArea: _landArea,
            carbonCredits: _carbonCredits,
            verifiedAt: 0,
            status: VerificationStatus.Pending,
            dataHash: _dataHash,
            tokensMinted: false
        });
        
        farmerProjects[_farmerAddress].push(_projectId);
        allProjectIds.push(_projectId);
        farmers[_farmerAddress].totalProjects++;
        
        emit ProjectRegistered(_projectId, _farmerAddress, _carbonCredits);
    }
    
    function verifyProjectAndMintTokens(string memory _projectId) external onlyOwner whenNotPaused {
        Project storage project = projects[_projectId];
        
        require(bytes(project.projectId).length > 0, "Project does not exist");
        require(project.status == VerificationStatus.Pending, "Already processed");
        require(!project.tokensMinted, "Tokens already minted");
        
        project.status = VerificationStatus.Verified;
        project.verifiedAt = block.timestamp;
        project.tokensMinted = true;
        
        farmers[project.farmerAddress].totalCredits += project.carbonCredits;
        
        _mint(project.farmerAddress, project.carbonCredits);
        
        emit ProjectVerified(_projectId, project.farmerAddress, project.carbonCredits);
        emit TokensMinted(_projectId, project.farmerAddress, project.carbonCredits);
    }
    
    function rejectProject(string memory _projectId) external onlyOwner {
        Project storage project = projects[_projectId];
        require(bytes(project.projectId).length > 0, "Project does not exist");
        require(project.status == VerificationStatus.Pending, "Already processed");
        
        project.status = VerificationStatus.Rejected;
    }
    
    function getProject(string memory _projectId) external view returns (
        string memory, address, uint256, uint256, uint256, 
        VerificationStatus, string memory, bool
    ) {
        Project memory p = projects[_projectId];
        return (p.projectId, p.farmerAddress, p.landArea, p.carbonCredits, 
                p.verifiedAt, p.status, p.dataHash, p.tokensMinted);
    }
    
    function getFarmer(address _addr) external view returns (
        string memory, string memory, uint256, uint256, uint256
    ) {
        Farmer memory f = farmers[_addr];
        return (f.aadharNumber, f.farmerName, f.totalProjects, f.totalCredits, balanceOf(_addr));
    }
    
    function getFarmerProjects(address _addr) external view returns (string[] memory) {
        return farmerProjects[_addr];
    }
    
    function getTotalProjects() external view returns (uint256) {
        return allProjectIds.length;
    }
    
    function getTotalFarmers() external view returns (uint256) {
        return allFarmers.length;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
}
