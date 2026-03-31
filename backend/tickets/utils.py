from datetime import datetime, timedelta
from django.utils import timezone
from core.models import BusinessHours


def add_business_hours(start_dt, delta):
    """
    Add a timedelta to start_dt, counting only business hours as defined in BusinessHours.
    """
    if not delta:
        return start_dt

    # Get business hours for all days
    business_hours = {
        bh.day: (bh.start_time, bh.end_time) for bh in BusinessHours.objects.filter(is_working_day=True)
    }
    if not business_hours:
        # Fallback: 24/7
        return start_dt + delta

    current = start_dt
    remaining = delta.total_seconds()
    while remaining > 0:
        weekday = current.weekday()
        if weekday not in business_hours:
            # Not a working day -> skip to next day start
            next_day = current.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
            seconds_to_next_day = (next_day - current).total_seconds()
            if seconds_to_next_day > remaining:
                current += timedelta(seconds=remaining)
                remaining = 0
            else:
                remaining -= seconds_to_next_day
                current = next_day
            continue

        start_time, end_time = business_hours[weekday]
        work_start = current.replace(
            hour=start_time.hour, 
            minute=start_time.minute, 
            second=start_time.second, 
            microsecond=0
        )
        work_end = current.replace(
            hour=end_time.hour, 
            minute=end_time.minute, 
            second=end_time.second, 
            microsecond=0
        )

        if current < work_start:
            # Before work start, jump to work start
            seconds_to_work_start = (work_start - current).total_seconds()
            if seconds_to_work_start > remaining:
                current += timedelta(seconds=remaining)
                remaining = 0
            else:
                remaining -= seconds_to_work_start
                current = work_start
        elif current < work_end:
            # Within working hours
            seconds_left_in_day = (work_end - current).total_seconds()
            seconds_to_add = min(remaining, seconds_left_in_day)
            current += timedelta(seconds=seconds_to_add)
            remaining -= seconds_to_add
            if remaining <= 0:
                break
            # Continue to next day if more time needed
            next_day = current.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
            current = next_day
        else:
            # After work hours, skip to next day
            next_day = current.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
            seconds_to_next_day = (next_day - current).total_seconds()
            if seconds_to_next_day > remaining:
                current += timedelta(seconds=remaining)
                remaining = 0
            else:
                remaining -= seconds_to_next_day
                current = next_day

    return current

