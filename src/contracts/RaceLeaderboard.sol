// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CarNFT.sol";

contract RaceLeaderboard is ERC721, Ownable {
    struct RaceResult {
        address player;
        uint256 carId;
        uint256 time;
        uint256 timestamp;
    }

    struct LeaderboardEntry {
        uint256 carId;
        address owner;
        uint256 bestTime;
        uint256 lastRaceTime;
    }

    CarNFT public carNFT;
    uint256 private _nextTokenId;
    mapping(uint256 => RaceResult) public raceResults;
    
    // Mapping para mantener el mejor tiempo por carro
    mapping(uint256 => uint256) private bestTimes;
    // Mapping para mantener el último tiempo de carrera por carro
    mapping(uint256 => uint256) private lastRaceTimes;
    // Array para mantener los IDs de los carros que han competido
    uint256[] private competingCarIds;
    // Mapping para saber si un carro ya está en el array de competidores
    mapping(uint256 => bool) private isCompeting;

    constructor(address _carNFT) ERC721("RaceResult", "RACE") Ownable(msg.sender) {
        carNFT = CarNFT(_carNFT);
        _nextTokenId = 1;
    }

    function mintRaceResult(uint256 carId, uint256 time) external returns (uint256) {
        require(carNFT.ownerOf(carId) == msg.sender, "No eres el dueno del carro");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        raceResults[tokenId] = RaceResult({
            player: msg.sender,
            carId: carId,
            time: time,
            timestamp: block.timestamp
        });

        // Actualizar mejor tiempo y último tiempo de carrera
        if (bestTimes[carId] == 0 || time < bestTimes[carId]) {
            bestTimes[carId] = time;
        }
        lastRaceTimes[carId] = block.timestamp;

        // Agregar carro a la lista de competidores si no está ya
        if (!isCompeting[carId]) {
            competingCarIds.push(carId);
            isCompeting[carId] = true;
        }

        // Llamar a la funcion de degradacion del carro
        carNFT.degradeCar(carId);
        
        return tokenId;
    }

    function getRaceResult(uint256 tokenId) external view returns (RaceResult memory) {
        require(_ownerOf(tokenId) != address(0), "El resultado no existe");
        return raceResults[tokenId];
    }

    function getLeaderboard() external view returns (LeaderboardEntry[] memory) {
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](competingCarIds.length);
        
        for (uint i = 0; i < competingCarIds.length; i++) {
            uint256 carId = competingCarIds[i];
            entries[i] = LeaderboardEntry({
                carId: carId,
                owner: carNFT.ownerOf(carId),
                bestTime: bestTimes[carId],
                lastRaceTime: lastRaceTimes[carId]
            });
        }
        
        return entries;
    }
} 