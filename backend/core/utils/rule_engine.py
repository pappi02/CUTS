def evaluate_condition(ticket, condition):
    """
    Recursively evaluate a condition tree.
    Condition can be a dict with logical operators 'and'/'or' or a leaf condition.
    """
    if 'and' in condition:
        return all(evaluate_condition(ticket, sub) for sub in condition['and'])
    elif 'or' in condition:
        return any(evaluate_condition(ticket, sub) for sub in condition['or'])
    elif 'not' in condition:
        return not evaluate_condition(ticket, condition['not'])
    else:
        # leaf condition: e.g., {"field": "category", "operator": "eq", "value": 5}
        field = condition['field']
        op = condition['operator']
        value = condition['value']

        # Get field value from ticket
        ticket_value = getattr(ticket, field, None)
        if ticket_value is None:
            return False

        # Operators
        if op == 'eq':
            return ticket_value == value
        elif op == 'ne':
            return ticket_value != value
        elif op == 'in':
            return ticket_value in value if isinstance(value, (list, tuple)) else ticket_value == value
        elif op == 'gt':
            return ticket_value > value
        elif op == 'lt':
            return ticket_value < value
        elif op == 'gte':
            return ticket_value >= value
        elif op == 'lte':
            return ticket_value <= value
        return False


def apply_actions(ticket, actions):
    """Apply actions to ticket (in-memory, returns modified ticket)"""
    from core.models import AssignmentGroup
    if 'assign_group' in actions:
        try:
            ticket.assigned_group = AssignmentGroup.objects.get(id=actions['assign_group'])
        except AssignmentGroup.DoesNotExist:
            pass
    if 'set_priority' in actions:
        ticket.priority = actions['set_priority']
    if 'set_status' in actions:
        ticket.status = actions['set_status']
    if 'set_custom_field' in actions:
        if not ticket.custom_fields:
            ticket.custom_fields = {}
        ticket.custom_fields.update(actions['set_custom_field'])
    # Add more actions as needed
    return ticket
