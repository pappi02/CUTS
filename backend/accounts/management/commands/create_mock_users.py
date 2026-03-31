from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import School, Department, AssignmentGroup
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create mock users, schools, departments, and assignment groups for development'

    def handle(self, *args, **options):
        # Schools
        schools_data = [
            {'name': 'School of Agriculture, Food Security and Environmental Sciences', 'code': 'AGRI'},
            {'name': 'School of Arts & Social Sciences', 'code': 'ARTS'},
            {'name': 'School of Business & Economics', 'code': 'BUSI'},
            {'name': 'School of Computing & Informatics', 'code': 'COMP'},
            {'name': 'School of Education', 'code': 'EDUC'},
        ]
        school_objs = []
        for data in schools_data:
            school, created = School.objects.get_or_create(code=data['code'], defaults={'name': data['name']})
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created school: {school.name}'))
            school_objs.append(school)

        # Departments (linked to random school)
        depts_data = [
            ('Horticulture', 'HORT', 'AGRI'),
            ('Computer Science', 'CS', 'COMP'),
            ('Business Administration', 'BA', 'BUSI'),
            ('English', 'ENG', 'ARTS'),
            ('Education Foundation', 'EDF', 'EDUC'),
        ]
        for name, code, school_code in depts_data:
            school = next(s for s in school_objs if s.code == school_code)
            dept, created = Department.objects.get_or_create(
                code=code, school=school, defaults={'name': name}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created department: {dept.name}'))

        # Assignment Groups (link to schools)
        groups_data = [
            {'name': 'IT Helpdesk', 'code': 'IT-HD', 'school_code': 'COMP'},
            {'name': 'Facilities – Agriculture', 'code': 'FAC-AGRI', 'school_code': 'AGRI'},
            {'name': 'Academic Advising – Business', 'code': 'ADV-BUSI', 'school_code': 'BUSI'},
        ]
        for data in groups_data:
            school = next(s for s in school_objs if s.code == data['school_code'])
            group, created = AssignmentGroup.objects.get_or_create(
                code=data['code'], defaults={'name': data['name'], 'school': school}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created group: {group.name}'))

        # Mock Users (20 random + superuser)
        roles = ['student', 'staff', 'faculty', 'admin']
        for i in range(20):
            username = f'user{i}'
            email = f'user{i}@cut.edu'
            role = random.choice(roles)
            school = random.choice(school_objs)
            dept = Department.objects.filter(school=school).first()
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': f'First{i}',
                    'last_name': f'Last{i}',
                    'role': role,
                    'school': school,
                    'department': dept,
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created {role}: {username}'))

        # Superuser
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@cut.edu',
                password='admin123',
                role='admin',
            )
            self.stdout.write(self.style.SUCCESS('Created superuser: admin'))

        # Create category tree
        from core.models import Category

        # Top-level categories
        it, _ = Category.objects.get_or_create(name="IT", defaults={'is_active': True})
        facilities, _ = Category.objects.get_or_create(name="Facilities", defaults={'is_active': True})
        academic, _ = Category.objects.get_or_create(name="Academic", defaults={'is_active': True})

        # IT subcategories
        hardware, _ = Category.objects.get_or_create(name="Hardware", parent=it, defaults={'is_active': True})
        software, _ = Category.objects.get_or_create(name="Software", parent=it, defaults={'is_active': True})
        printer, _ = Category.objects.get_or_create(name="Printer", parent=hardware, defaults={'is_active': True})
        laptop, _ = Category.objects.get_or_create(name="Laptop", parent=hardware, defaults={'is_active': True})

        # Facilities subcategories
        electrical, _ = Category.objects.get_or_create(name="Electrical", parent=facilities, defaults={'is_active': True})
        plumbing, _ = Category.objects.get_or_create(name="Plumbing", parent=facilities, defaults={'is_active': True})
        light_out, _ = Category.objects.get_or_create(name="Light Out", parent=electrical, defaults={'is_active': True})

        # Academic subcategories
        advising, _ = Category.objects.get_or_create(name="Advising", parent=academic, defaults={'is_active': True})
        registration, _ = Category.objects.get_or_create(name="Registration", parent=academic, defaults={'is_active': True})
        transcript, _ = Category.objects.get_or_create(name="Transcript Request", parent=registration, defaults={'is_active': True})

        self.stdout.write(self.style.SUCCESS('Created sample categories'))

        self.stdout.write(self.style.SUCCESS('Mock data creation complete!'))
