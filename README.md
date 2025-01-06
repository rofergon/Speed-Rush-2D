# Speed Rush 2D 🏎️

A high-speed 2D racing game built for the Lens Network ecosystem, combining the excitement of arcade racing with blockchain technology. The game uses Family for wallet authentication and management, React for a modern user interface, and Unity WebGL for a smooth gaming experience.

## 🎮 Live Demo

🚀 [Play Speed Rush 2D Now](https://speed-rush-2d.vercel.app)

## 🎮 Related Repositories

- 🎮 [Unity Game Repository](https://github.com/rofergon/Speed-Rush-2d-Unity-project) - Core game mechanics and physics
- 🔧 [Backend API Repository](https://github.com/rofergon/speed-rush-2d-backend-) - AI-powered car generation service
- ⛓️ [Smart Contracts Repository](https://github.com/rofergon/Speed-Rush-2D-contract) - Game's blockchain contracts

## 🎮 Main Features

### 🚗 NFT Vehicle System
- **AI Generation**: 
  - Each vehicle is uniquely generated by an AI agent that coordinates prompts for sprite generation
  - Generation system based on customizable prompts
  - Different visual styles: Cartoon, Realistic, Anime
  - Each vehicle is an NFT with unique metadata
  - Each part is an NFT with unique metadata
  - Automatic image processing with background removal
  - IPFS storage through Lighthouse

### 🔧 NFT Parts System
- **Interchangeable Parts**:
  - Engine:
    - Affects speed and acceleration
    - Stats: Power, Efficiency, Durability
  - Transmission:
    - Influences speed changes and handling
    - Stats: Shift Speed, Efficiency, Control
  - Core:
    - Determines base vehicle characteristics
    - Stats: Traction, Handling, Grip
- **Part Features**:
  - Each part is an independent NFT
  - Unique rarity and stats system
  - Possibility of exchange between vehicles
  - Directly affect race performance

### 🏁 Racing System
- **Game Modes**:
  - Time Trial: Compete for best times
  - Daily challenges with prize accumulation
  - Special tournaments with guaranteed prizes
- **Game Mechanics**:
  - 2D topdown arcade physics system
  - Drifting
  - Different types of tracks
  - Lap system and result recording in the leaderboard
- **Prize System**:
  - Each result record contributes to the current pool
  - Automatic pool prize distribution at the end of the tournament
  - Distribution percentages:
    - 50% for first place
    - 30% for second place
    - 15% for third place
    - 5% for community fund

### 💰 Game Economy
- **GRASS Token**:
  - Game's native token
  - Uses:
    - Minting new vehicles
    - Buying/selling in the marketplace
    - Vehicle repairs
    - Participation in special events
- **Marketplace System**:
  - Vehicle and parts listing
  - Offer system
  - Advanced search filters
  - Transaction history
  - Configurable commission (2.5% by default)

## 🚀 Detailed Technologies

### Frontend
- **React + TypeScript**:
  - State management with custom services
  - Reusable components
  - Routing system with React Router
  - Type safety with TypeScript

### Backend (API)
- **FastAPI + Python**:
  - Sprite generation with Stability AI v2beta
  - Image processing system with PIL and rembg
  - IPFS storage with Lighthouse
  - Cache and pre-generation system
  - Parallel processing with asyncio

### Game Engine
- **Unity WebGL**:
  - Optimized 2D topdown physics system
  - Efficient asset management
  - Bidirectional Web3 communication

### Blockchain (Lens Network Testnet)
- **Deployed Contracts**:
  - CarPart: `0xCA4E04724234D99122C01268a8a0cD722450c67E`
  - CarNFT: `0x95dA1E4C0961295ED0D1F316474c1a3a6E868349`
  - CarWorkshop: `0xf2BBd1BEDB23915Ab77cd69265eaD8D442C10980`
  - RaceLeaderboard: `0xD75aA67d5Bb1f8aCA77b4d14da847C28CdEE9a0D`
  - CarMarketplace: `0x73b378F1368D9aC0394AB1C8aB85EFB3e4216DcC`

### Stats System
- **Engine**:
  - stat1: Speed
  - stat2: Max Speed
  - stat3: Acceleration
- **Transmission**:
  - stat1: Acceleration
  - stat2: Speed
  - stat3: Handling
- **Core**:
  - stat1: Handling
  - stat2: Drift
  - stat3: Turn

### Condition System
- Cars start with 100% condition
- Condition degrades 5% after each race
- Can be repaired in the workshop for a fee
- Condition directly affects performance

## 🔧 Setup

1. Clone the repository
```bash
git clone https://github.com/rofergon/Speed-Rush-2D
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```env
VITE_RACE_LEADERBOARD_ADDRESS=<contract_address>
VITE_CAR_NFT_ADDRESS=<contract_address>
VITE_PART_NFT_ADDRESS=<contract_address>
VITE_MARKETPLACE_ADDRESS=<contract_address>
VITE_GARAGE_ADDRESS=<contract_address>
VITE_LENS_NETWORK_HUB=<hub_address>
```

4. Start development server
```bash
npm run dev
```

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributions

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/rofergon/Speed-Rush-2D/issues).

### Contribution Guidelines
1. Fork the project
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---
Built with ❤️ for the Lens Network community
