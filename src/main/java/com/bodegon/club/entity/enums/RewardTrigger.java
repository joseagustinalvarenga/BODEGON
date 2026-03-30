package com.bodegon.club.entity.enums;

public enum RewardTrigger {
    ALWAYS,             // Siempre disponible (comportamiento por defecto)
    BIRTHDAY,           // Solo el día de cumpleaños exacto del miembro (mismo día y mes)
    BIRTH_MONTH,        // Durante todo el mes de cumpleaños del miembro
    BIRTH_DAY_OF_MONTH, // El día del mes que coincide con el día de nacimiento (ej: cada día 10)
    DAY_OF_WEEK         // Un día de la semana fijo (triggerValue = MONDAY..SUNDAY)
}
