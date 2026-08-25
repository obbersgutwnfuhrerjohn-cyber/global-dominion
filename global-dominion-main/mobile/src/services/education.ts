import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface EducationServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type EducationLevel =
  | "primary"
  | "secondary"
  | "vocational"
  | "university"
  | "postgraduate";

export type InstitutionType =
  | "school"
  | "college"
  | "university"
  | "vocational";

export interface EducationInstitution {
  id: string;

  name: string;

  countryId: string;

  cityId: string;

  type: InstitutionType;

  educationLevel: EducationLevel;

  capacity: number;

  enrolledStudents: number;

  quality: number;

  staffCount: number;

  funding: number;

  tuition: number;

  researchCapacity: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface StudentProfile {
  id: string;

  playerId: PlayerId;

  institutionId: string;

  educationLevel: EducationLevel;

  fieldOfStudy: string;

  skillLevel: number;

  progress: number;

  tuitionPaid: number;

  status:
    | "enrolled"
    | "graduated"
    | "dropped_out";

  enrolledAt: string;

  graduationAt: string | null;
}

export interface EducationStats {
  countryId: string;

  literacyRate: number;

  enrollmentRate: number;

  universityEnrollmentRate: number;

  averageEducationLevel: number;

  educationSpending: number;

  graduateCount: number;

  skilledWorkerPercentage: number;

  updatedAt: string;
}

function requirePlayer(
  options: EducationServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class EducationService {
  private readonly options: EducationServiceOptions;

  constructor(
    options: EducationServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getInstitutions(
    countryId?: string,
    cityId?: string,
    type?: InstitutionType,
  ): Promise<EducationInstitution[]> {
    return apiClient.get<EducationInstitution[]>(
      "/education/institutions",
      {
        countryId,
        cityId,
        type,
      },
    );
  }

  public async getInstitution(
    institutionId: string,
  ): Promise<EducationInstitution> {
    return apiClient.get<EducationInstitution>(
      `/education/institutions/${encodeURIComponent(
        institutionId,
      )}`,
    );
  }

  public async enroll(
    request: {
      institutionId: string;

      educationLevel: EducationLevel;

      fieldOfStudy: string;
    },
  ): Promise<StudentProfile> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<StudentProfile>(
      "/education/enrollment",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyEducation(): Promise<
    StudentProfile[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<StudentProfile[]>(
      `/education/students/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getStats(
    countryId: string,
  ): Promise<EducationStats> {
    return apiClient.get<EducationStats>(
      `/education/countries/${encodeURIComponent(
        countryId,
      )}/stats`,
    );
  }
}

export const educationService =
  new EducationService();