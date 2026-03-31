from rest_framework import serializers
from .models import School, Department, Category, AssignmentGroup


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    school = SchoolSerializer(read_only=True)

    class Meta:
        model = Department
        fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id',           
            'name',           
            'parent',         
            'default_assignment_group',           
            'is_active',           
            'children'
        ]

    def get_children(self, obj):
        children = obj.get_children()
        if children.exists():  # ✅ better check
            return CategorySerializer(children, many=True).data
        return []


class AssignmentGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentGroup
        fields = '__all__'