// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NumbersNFT is ERC721Enumerable, ReentrancyGuard {
    uint256 constant  maxSupply = 10000;

    uint256 lastMintedId = 10001;
    uint public lastMintedInBlock;

    constructor(uint256[10] memory Initial) ERC721("Numbers", "N") {
        for (uint i=0; i<Initial.length; i++) {
            _safeMint(_msgSender(), Initial[i]);
        }
    }

    function random(uint256 seed) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(seed)));
    }

    function truncate(uint256 input, uint256 base) internal pure returns (uint256) {
        return input % base;
    }

    function mint() public nonReentrant {

        require(block.number != lastMintedInBlock, "Already one mint in this block");
        lastMintedInBlock = block.number;

        uint256 output = random(lastMintedId);
        uint256 idToMint= truncate(output, maxSupply);

        while (_exists(idToMint)) {
            output = random(output);
            idToMint = truncate(output, maxSupply);
        }

        lastMintedId = idToMint;
        _safeMint(_msgSender(), idToMint);
    }

    function getText(uint256 tokenId) public view returns (string memory) {
        return Strings.toString(tokenId);
    }

    function tokenURI(uint256 tokenId) override public view returns (string memory) {
        string[3] memory parts;
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: monospace; font-size: 60px; }</style><rect width="100%" height="100%" fill="black" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="base">';

        parts[1] = getText(tokenId);

        parts[2] = '</text></svg>';

        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2]));

        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "Number ', Strings.toString(tokenId), '", "description": "Numbers NFT - Spans the numbers 1 to 9999. Nothing more to it.", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));

        return output;
    }
}


/// [MIT License]
/// @title Base64
/// @notice Provides a function for encoding some bytes in base64
/// @author Brecht Devos <brecht@loopring.org>
library Base64 {
    bytes internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    /// @notice Encodes some bytes to the base64 representation
    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((len + 2) / 3);

        // Add some extra buffer at the end
        bytes memory result = new bytes(encodedLen + 32);

        bytes memory table = TABLE;

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for {
                let i := 0
            } lt(i, len) {

            } {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)

                mstore(resultPtr, out)

                resultPtr := add(resultPtr, 4)
            }

            switch mod(len, 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }

            mstore(result, encodedLen)
        }

        return string(result);
    }
}
