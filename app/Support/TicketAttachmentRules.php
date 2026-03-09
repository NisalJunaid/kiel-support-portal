<?php

namespace App\Support;

class TicketAttachmentRules
{
    public const MAX_SIZE_KB = 5120;

    public static function allowedMimes(): string
    {
        return 'pdf,jpg,jpeg,png,gif,webp,txt,csv,doc,docx,xls,xlsx';
    }

    public static function validationRules(): array
    {
        return [
            'array',
            'max:5',
        ];
    }

    public static function fileRules(): array
    {
        return [
            'file',
            'max:'.self::MAX_SIZE_KB,
            'mimes:'.self::allowedMimes(),
        ];
    }
}
