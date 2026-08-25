import type {
  AllianceId,
  CountryId,
  PartyId,
  PlayerId
} from "./game";

export type ElectionType =
  | "presidential"
  | "parliamentary"
  | "local"
  | "leadership";

export type ElectionStatus =
  | "scheduled"
  | "campaign"
  | "voting"
  | "counting"
  | "completed"
  | "cancelled";

export type GovernmentPosition =
  | "president"
  | "prime_minister"
  | "vice_president"
  | "foreign_minister"
  | "defense_minister"
  | "economy_minister"
  | "interior_minister"
  | "parliament_member"
  | "governor"
  | "mayor";

export type TreatyType =
  | "non_aggression"
  | "mutual_defense"
  | "trade"
  | "intelligence"
  | "peace"
  | "military_access"
  | "research"
  | "economic";

export type TreatyStatus =
  | "proposed"
  | "negotiating"
  | "signed"
  | "active"
  | "expired"
  | "cancelled";

export type DiplomaticAction =
  | "improve_relations"
  | "reduce_relations"
  | "propose_treaty"
  | "invite_alliance"
  | "leave_alliance"
  | "declare_war"
  | "offer_peace"
  | "request_trade"
  | "impose_sanctions";

export interface PoliticalParty {
  id: PartyId;

  countryId: CountryId;

  name: string;

  abbreviation: string;

  ideology: string;

  platform: string[];

  leaderId: PlayerId | null;

  memberCount: number;

  popularity: number;

  treasury: number;

  foundedAt: string;

  active: boolean;
}

export interface PoliticalCandidate {
  id: string;

  playerId: PlayerId;

  countryId: CountryId;

  partyId: PartyId | null;

  electionId: string;

  campaignName: string;

  platform: string[];

  campaignFunds: number;

  popularity: number;

  approvalRating: number;

  votesReceived: number;

  elected: boolean;
}

export interface Election {
  id: string;

  countryId: CountryId;

  type: ElectionType;

  status: ElectionStatus;

  seatsAvailable: number;

  eligibleVoters: number;

  votesCast: number;

  turnoutPercentage: number;

  candidateIds: string[];

  startedAt: string;

  votingEndsAt: string;

  completedAt: string | null;

  winnerPlayerId: PlayerId | null;
}

export interface ElectionResult {
  electionId: string;

  countryId: CountryId;

  winnerPlayerId: PlayerId | null;

  partyResults: PartyElectionResult[];

  candidateResults: CandidateElectionResult[];

  turnoutPercentage: number;

  completedAt: string;
}

export interface PartyElectionResult {
  partyId: PartyId;

  votes: number;

  percentage: number;

  seatsWon: number;
}

export interface CandidateElectionResult {
  candidateId: string;

  playerId: PlayerId;

  votes: number;

  percentage: number;

  elected: boolean;
}

export interface Vote {
  id: string;

  electionId: string;

  voterPlayerId: PlayerId;

  candidateId: string | null;

  partyId: PartyId | null;

  submittedAt: string;
}

export interface Parliament {
  countryId: CountryId;

  totalSeats: number;

  occupiedSeats: number;

  partySeats: Record<PartyId, number>;

  coalitionPartyIds: PartyId[];

  oppositionPartyIds: PartyId[];

  governmentApproval: number;

  createdAt: string;

  updatedAt: string;
}

export interface Government {
  countryId: CountryId;

  leaderId: PlayerId | null;

  leaderPosition:
    | "president"
    | "prime_minister";

  ministerPositions: GovernmentMinister[];

  coalitionPartyIds: PartyId[];

  approvalRating: number;

  stability: number;

  termStartedAt: string;

  termEndsAt: string;
}

export interface GovernmentMinister {
  position: GovernmentPosition;

  playerId: PlayerId | null;

  appointedAt: string | null;
}

export interface PoliticalEvent {
  id: string;

  countryId: CountryId;

  type:
    | "election"
    | "vote_of_no_confidence"
    | "coalition_change"
    | "government_change"
    | "protest"
    | "scandal"
    | "policy_change"
    | "leadership_change";

  title: string;

  description: string;

  affectedPlayerIds: PlayerId[];

  affectedPartyIds: PartyId[];

  approvalImpact: number;

  stabilityImpact: number;

  createdAt: string;
}

export interface DiplomaticRelation {
  countryA: CountryId;

  countryB: CountryId;

  score: number;

  level:
    | "hostile"
    | "tense"
    | "neutral"
    | "friendly"
    | "allied";

  tradeValue: number;

  militaryCooperation: number;

  diplomaticTrust: number;

  updatedAt: string;
}

export interface Alliance {
  id: AllianceId;

  name: string;

  founderCountryId: CountryId;

  memberCountryIds: CountryId[];

  mutualDefense: boolean;

  intelligenceSharing: boolean;

  militaryAccess: boolean;

  tradeBenefits: boolean;

  foundedAt: string;

  active: boolean;
}

export interface Treaty {
  id: string;

  type: TreatyType;

  proposingCountryId: CountryId;

  participatingCountryIds: CountryId[];

  status: TreatyStatus;

  terms: string[];

  durationDays: number | null;

  signedAt: string | null;

  expiresAt: string | null;
}

export interface DiplomaticMessage {
  id: string;

  senderPlayerId: PlayerId;

  senderCountryId: CountryId;

  recipientPlayerId: PlayerId | null;

  recipientCountryId: CountryId | null;

  subject: string;

  message: string;

  createdAt: string;

  read: boolean;
}

export interface PeaceNegotiation {
  id: string;

  warId: string;

  initiatingCountryId: CountryId;

  participatingCountryIds: CountryId[];

  proposedTerms: string[];

  proposedByPlayerId: PlayerId;

  acceptedCountryIds: CountryId[];

  rejectedCountryIds: CountryId[];

  status:
    | "proposed"
    | "negotiating"
    | "accepted"
    | "rejected"
    | "expired";

  createdAt: string;

  resolvedAt: string | null;
}