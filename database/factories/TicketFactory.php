<?php

namespace Database\Factories;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\ClientCompany;
use App\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        return [
            'ticket_number' => fake()->unique()->bothify('TCK-#####'),
            'client_company_id' => ClientCompany::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'category' => 'Support',
            'priority' => fake()->randomElement(TicketPriority::cases())->value,
            'status' => TicketStatus::New->value,
            'source' => 'email',
        ];
    }
}
