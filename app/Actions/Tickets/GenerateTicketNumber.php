<?php

namespace App\Actions\Tickets;

use Illuminate\Support\Facades\DB;

class GenerateTicketNumber
{
    public function execute(): string
    {
        return DB::transaction(function () {
            $year = (int) now()->format('Y');

            $sequence = DB::table('ticket_sequences')
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if (! $sequence) {
                DB::table('ticket_sequences')->insert([
                    'year' => $year,
                    'current_value' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $sequence = DB::table('ticket_sequences')
                    ->where('year', $year)
                    ->lockForUpdate()
                    ->first();
            }

            $next = (int) $sequence->current_value + 1;

            DB::table('ticket_sequences')
                ->where('id', $sequence->id)
                ->update([
                    'current_value' => $next,
                    'updated_at' => now(),
                ]);

            return sprintf('TCK-%d-%05d', $year, $next);
        });
    }
}
