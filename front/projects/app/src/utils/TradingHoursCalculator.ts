export class TradingHoursCalculator {
  private static readonly DAY_INDEX: Record<string, number> = {
    'Sunday': 7,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
  };

  static calculate(
    openTime: string,
    closeTime: string,
    tradingDays: number[],
    timezone: string,
    holidays: string[],
  ): boolean {
    const now = new Date();

    const dayName = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
    }).format(now);

    const dayOfWeek = this.DAY_INDEX[dayName] ?? 0;
    if (!tradingDays.includes(dayOfWeek)) {
      return false;
    }

    const dateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    if (holidays.includes(dateStr)) {
      return false;
    }

    const currentTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);

    return currentTime >= openTime && currentTime < closeTime;
  }
}
