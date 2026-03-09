/**
 * READ UNIVERSAL PROFILE DATA WITH ERC725.JS
 *
 * USE CASE: Fetch a user's full LSP3 profile (name, avatar, bio, tags, social links)
 *           from any Universal Profile address on LUKSO Mainnet.
 *
 * This is the standard entry point for any LUKSO dApp that displays user profiles.
 * erc725.js automatically:
 * - Decodes ABI-encoded ERC725Y values
 * - Resolves IPFS hashes to full URLs
 * - Handles the VerifiableURI format for LSP3ProfileMetadata
 *
 * INSTALL:
 *   npm install @erc725/erc725.js
 *
 * Docs: https://docs.lukso.tech/standards/metadata/lsp3-profile-metadata
 *       https://docs.lukso.tech/tools/erc725js/getting-started
 */

import ERC725, { ERC725JSONSchema } from "@erc725/erc725.js";
import LSP3ProfileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";

const LUKSO_RPC = "https://rpc.mainnet.lukso.network";
const IPFS_GATEWAY = "https://api.universalprofile.cloud/ipfs/";

// ── Types ──────────────────────────────────────────────────────────────────

interface SocialLink {
  title: string;
  url: string;
}

interface UniversalProfileData {
  address: string;
  name: string;
  description: string;
  avatar?: string;
  backgroundImage?: string;
  tags: string[];
  links: SocialLink[];
}

// ── Core function ──────────────────────────────────────────────────────────

/**
 * Fetch and decode a Universal Profile's LSP3 metadata.
 *
 * @param upAddress  The Universal Profile address (checksummed 0x...)
 * @returns          Decoded profile data, or null if the UP has no profile set
 */
async function fetchUniversalProfile(upAddress: string): Promise<UniversalProfileData | null> {
  const erc725 = new ERC725(
    LSP3ProfileSchema as ERC725JSONSchema[],
    upAddress,
    LUKSO_RPC,
    { ipfsGateway: IPFS_GATEWAY }
  );

  // fetchData resolves the IPFS URI and decodes the JSON automatically
  const profileData = await erc725.fetchData("LSP3Profile");

  if (!profileData?.value) return null;

  const profile = (profileData.value as any).LSP3Profile;

  // Resolve avatar — profile images are stored as an array (multiple resolutions)
  const resolveIpfs = (url?: string) =>
    url ? url.replace("ipfs://", IPFS_GATEWAY) : undefined;

  const avatar = resolveIpfs(profile.profileImage?.[0]?.url);
  const backgroundImage = resolveIpfs(profile.backgroundImage?.[0]?.url);

  return {
    address: upAddress,
    name: profile.name ?? "Unknown",
    description: profile.description ?? "",
    avatar,
    backgroundImage,
    tags: profile.tags ?? [],
    links: profile.links ?? [],
  };
}

// ── Batch fetch helper ─────────────────────────────────────────────────────

/**
 * Fetch multiple UP profiles in parallel.
 * Useful for leaderboards, follower lists, Discover pages, etc.
 */
async function fetchMultipleProfiles(
  upAddresses: string[]
): Promise<(UniversalProfileData | null)[]> {
  return Promise.all(upAddresses.map(fetchUniversalProfile));
}

// ── Usage ──────────────────────────────────────────────────────────────────

const UP_ADDRESS = "0x82C4DC98e27CFe9D7d312250e972e7380Fbf6B77"; // example UP on LUKSO Mainnet

fetchUniversalProfile(UP_ADDRESS).then((profile) => {
  if (!profile) {
    console.log("❌ No LSP3 profile found for this address");
    return;
  }

  console.log("✅ Universal Profile loaded:");
  console.log("  Name:       ", profile.name);
  console.log("  Bio:        ", profile.description || "(empty)");
  console.log("  Avatar:     ", profile.avatar ?? "(none)");
  console.log("  Background: ", profile.backgroundImage ?? "(none)");
  console.log("  Tags:       ", profile.tags.join(", ") || "(none)");
  console.log("  Links:      ", profile.links.map((l) => `${l.title}: ${l.url}`).join(", ") || "(none)");
});
