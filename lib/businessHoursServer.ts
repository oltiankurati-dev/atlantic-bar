import "server-only";
import { getDb } from "@/lib/firebaseAdmin";
import {
  BUSINESS_HOURS_DEFAULTS,
  DAY_ORDER,
  isValidDayHours,
  type BusinessHours,
} from "@/lib/businessHours";

export { dayKeyOf, todayInBerlin } from "@/lib/businessHours";

/** Saved hours from Firestore, falling back to the defaults day by day. */
export async function getBusinessHours(): Promise<BusinessHours> {
  const doc = await getDb().collection("siteContent").doc("businessHours").get();
  const saved = doc.data()?.days as Partial<BusinessHours> | undefined;

  const hours: BusinessHours = { ...BUSINESS_HOURS_DEFAULTS };
  if (saved) {
    for (const day of DAY_ORDER) {
      const override = saved[day];
      if (isValidDayHours(override)) hours[day] = override;
    }
  }
  return hours;
}
