<?php

namespace App\Support;

use Spatie\Activitylog\Models\Activity;

class ActivityPresenter
{
    public static function forTimeline(Activity $activity): array
    {
        return [
            'id' => $activity->id,
            'log_name' => $activity->log_name,
            'event' => $activity->event,
            'description' => $activity->description,
            'causer_name' => $activity->causer?->name,
            'subject_type' => class_basename((string) $activity->subject_type),
            'properties' => $activity->properties ?? [],
            'created_at' => optional($activity->created_at)?->toDateTimeString(),
        ];
    }
}
