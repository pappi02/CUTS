from rest_framework import permissions
from .models import Ticket


class IsAssignedOrAdmin(permissions.BasePermission):
    """
    Object-level permission to check if user:
    - is admin
    - is assigned_to the ticket
    - belongs to assigned_group
    - is requester (for read actions like retrieve)
    """
    def has_object_permission(self, request, view, obj: Ticket):
        user = request.user
        if not hasattr(user, 'role'):
            return False
        
        if user.role == 'admin':
            return True
        
        if obj.assigned_to == user:
            return True
        
        if obj.assigned_group and hasattr(user, 'assignmentgroup_set'):
            if user.assignmentgroup_set.filter(id=obj.assigned_group.id).exists():
                return True
        
        # Allow requester to view (retrieve)
        if view.action in ['retrieve', 'list'] and obj.requester == user:
            return True
        
        return False
