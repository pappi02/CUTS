from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import School, Department, AssignmentGroup
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create mock users, schools, departments, and assignment groups for development'

    def handle(self, *args, **options):
        # ============================================================
        # SCHOOLS (14 Schools as per Maseno University structure)
        # Based on: https://www.maseno.ac.ke/maseno-brief [citation:5][citation:7]
        # ============================================================
        schools_data = [
            {'name': 'School of Agriculture and Food Security', 'code': 'AGRI'},
            {'name': 'School of Arts and Social Sciences', 'code': 'ARTS'},
            {'name': 'School of Business and Economics', 'code': 'BUSI'},
            {'name': 'School of Computing and Informatics', 'code': 'COMP'},
            {'name': 'School of Development and Strategic Studies', 'code': 'DEVS'},
            {'name': 'School of Education', 'code': 'EDUC'},
            {'name': 'School of Environment and Earth Sciences', 'code': 'ENVS'},
            {'name': 'School of Law', 'code': 'LAW'},
            {'name': 'School of Mathematics, Statistics and Actuarial Sciences', 'code': 'MATH'},
            {'name': 'School of Medicine', 'code': 'MED'},
            {'name': 'School of Nursing', 'code': 'NURS'},
            {'name': 'School of Pharmacy', 'code': 'PHAR'},
            {'name': 'School of Physical and Biological Sciences', 'code': 'PHYS'},
            {'name': 'School of Planning and Architecture', 'code': 'PLAN'},
            {'name': 'Institute of Gender Studies', 'code': 'GEND'},
        ]
        
        school_objs = []
        for data in schools_data:
            school, created = School.objects.get_or_create(
                code=data['code'], 
                defaults={'name': data['name']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created school: {school.name}'))
            school_objs.append(school)

        # ============================================================
        # DEPARTMENTS (Based on actual Maseno University structure)
        # Sources: eLearning platform [citation:1], Programmes page [citation:6]
        # ============================================================
        depts_data = [
            # School of Agriculture and Food Security (AGRI)
            ('Agricultural Economics and Rural Development', 'AGEC', 'AGRI'),
            ('Animal Science', 'ANSC', 'AGRI'),
            ('Applied Plant Science', 'APSC', 'AGRI'),
            ('Fisheries and Natural Resources', 'FISH', 'AGRI'),
            ('Soil Science', 'SOIL', 'AGRI'),
            
            # School of Arts and Social Sciences (ARTS)
            ('Communication and Media Technology', 'CMT', 'ARTS'),
            ('French and Other Foreign Languages', 'FREN', 'ARTS'),
            ('History and Archaeology', 'HIST', 'ARTS'),
            ('Kiswahili and Other African Languages', 'KISW', 'ARTS'),
            ('Linguistics', 'LING', 'ARTS'),
            ('Literary Studies', 'LITS', 'ARTS'),
            ('Music and Theatre Studies', 'MUSI', 'ARTS'),
            ('Psychology', 'PSYC', 'ARTS'),
            ('Religion, Theology and Philosophy', 'RTP', 'ARTS'),
            ('Sociology and Anthropology', 'SOCA', 'ARTS'),
            ('Geography and Natural Resources Management', 'GEOG', 'ARTS'),
            
            # School of Business and Economics (BUSI)
            ('Accounting and Finance', 'ACCT', 'BUSI'),
            ('Business Administration', 'BADM', 'BUSI'),
            ('Economics', 'ECON', 'BUSI'),
            ('Human Resource Management', 'HRM', 'BUSI'),
            ('Marketing', 'MKTG', 'BUSI'),
            ('Procurement and Supply Chain Management', 'PSCM', 'BUSI'),
            
            # School of Computing and Informatics (COMP)
            ('Computer Science', 'CS', 'COMP'),
            ('Information Technology', 'IT', 'COMP'),
            ('Information Systems', 'IS', 'COMP'),
            ('Computer Technology', 'CT', 'COMP'),
            ('Business Information Technology', 'BIT', 'COMP'),
            
            # School of Development and Strategic Studies (DEVS)
            ('Development Studies', 'DEVS', 'DEVS'),
            ('International Relations and Diplomacy', 'IRD', 'DEVS'),
            ('Political Science', 'POLS', 'DEVS'),
            ('Peace and Security Studies', 'PSS', 'DEVS'),
            
            # School of Education (EDUC)
            ('Educational Communication and Technology', 'ECT', 'EDUC'),
            ('Educational Foundations', 'EDF', 'EDUC'),
            ('Educational Psychology', 'EPY', 'EDUC'),
            ('Special Needs Education', 'SNE', 'EDUC'),
            ('Curriculum Studies', 'CURR', 'EDUC'),
            ('Early Childhood Education', 'ECE', 'EDUC'),
            
            # School of Environment and Earth Sciences (ENVS)
            ('Environmental Science', 'ENVS', 'ENVS'),
            ('Earth Sciences', 'EART', 'ENVS'),
            ('Climate Change and Development', 'CLIM', 'ENVS'),
            
            # School of Law (LAW)
            ('Public Law', 'PUBL', 'LAW'),
            ('Private Law', 'PRIV', 'LAW'),
            
            # School of Mathematics, Statistics and Actuarial Sciences (MATH)
            ('Actuarial Science', 'ACSC', 'MATH'),
            ('Applied Statistics', 'APST', 'MATH'),
            ('Pure Mathematics', 'PURE', 'MATH'),
            ('Applied Mathematics', 'APMA', 'MATH'),
            
            # School of Medicine (MED)
            ('Human Anatomy', 'ANAT', 'MED'),
            ('Medical Biochemistry', 'BIOC', 'MED'),
            ('Medical Microbiology', 'MICR', 'MED'),
            ('Medical Physiology', 'PHYS', 'MED'),
            ('Obstetrics and Gynaecology', 'OBGY', 'MED'),
            ('Paediatrics and Child Health', 'PAED', 'MED'),
            ('Internal Medicine', 'IMED', 'MED'),
            ('Surgery and Anaesthesiology', 'SURG', 'MED'),
            ('Family and Emergency Medicine', 'FAME', 'MED'),
            ('Psychiatry', 'PSY', 'MED'),
            ('Radiology', 'RAD', 'MED'),
            ('Pathology', 'PATH', 'MED'),
            ('Pharmacology', 'PHAR', 'MED'),
            ('Medical Laboratory Science', 'MLS', 'MED'),
            
            # School of Nursing (NURS)
            ('Nursing Science', 'NURS', 'NURS'),
            ('Community Health Nursing', 'CHN', 'NURS'),
            
            # School of Pharmacy (PHAR)
            ('Pharmaceutical Sciences', 'PHSC', 'PHAR'),
            ('Clinical Pharmacy', 'CLPH', 'PHAR'),
            
            # School of Physical and Biological Sciences (PHYS)
            ('Botany', 'BOT', 'PHYS'),
            ('Chemistry', 'CHEM', 'PHYS'),
            ('Physics', 'PHY', 'PHYS'),
            ('Zoology', 'ZOOL', 'PHYS'),
            ('Biochemistry', 'BIOC', 'PHYS'),
            ('Cell and Molecular Biology', 'CMB', 'PHYS'),
            
            # School of Planning and Architecture (PLAN)
            ('Urban and Regional Planning', 'URPL', 'PLAN'),
            ('Architecture', 'ARCH', 'PLAN'),
            ('Geospatial Information Science', 'GIS', 'PLAN'),
            ('Disaster Management', 'DISM', 'PLAN'),
            
            # Institute of Gender Studies (GEND)
            ('Gender and Development', 'GEND', 'GEND'),
            ('Women\'s Studies', 'WOST', 'GEND'),
        ]
        
        for name, code, school_code in depts_data:
            school = next((s for s in school_objs if s.code == school_code), None)
            if school:
                dept, created = Department.objects.get_or_create(
                    code=code, 
                    school=school, 
                    defaults={'name': name}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created department: {dept.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'School {school_code} not found for department {name}'))

        # ============================================================
        # ASSIGNMENT GROUPS (Support teams for ticket routing)
        # ============================================================
        groups_data = [
            # Central IT Support
            {'name': 'Central IT Helpdesk', 'code': 'IT-HD', 'school_code': 'COMP'},
            {'name': 'Network Operations Center', 'code': 'NOC', 'school_code': 'COMP'},
            {'name': 'Software Support Team', 'code': 'SW-SUPP', 'school_code': 'COMP'},
            
            # Facilities Management
            {'name': 'Facilities Management - Main Campus', 'code': 'FAC-MAIN', 'school_code': None},
            {'name': 'Facilities Management - Agriculture', 'code': 'FAC-AGRI', 'school_code': 'AGRI'},
            {'name': 'Facilities Management - Medicine', 'code': 'FAC-MED', 'school_code': 'MED'},
            {'name': 'Facilities Management - Library', 'code': 'FAC-LIB', 'school_code': None},
            
            # Academic Advising
            {'name': 'Academic Advising - Business', 'code': 'ADV-BUSI', 'school_code': 'BUSI'},
            {'name': 'Academic Advising - Arts', 'code': 'ADV-ARTS', 'school_code': 'ARTS'},
            {'name': 'Academic Advising - Science', 'code': 'ADV-SCI', 'school_code': 'PHYS'},
            {'name': 'Academic Advising - Education', 'code': 'ADV-EDUC', 'school_code': 'EDUC'},
            {'name': 'Academic Advising - Medicine', 'code': 'ADV-MED', 'school_code': 'MED'},
            
            # Student Services
            {'name': 'Registrar\'s Office', 'code': 'REG', 'school_code': None},
            {'name': 'Finance Office', 'code': 'FIN', 'school_code': None},
            {'name': 'Library Services', 'code': 'LIB', 'school_code': None},
            {'name': 'Career Services', 'code': 'CAREER', 'school_code': None},
            
            # Specialized Support
            {'name': 'Research Support', 'code': 'RES-SUPP', 'school_code': None},
            {'name': 'International Student Support', 'code': 'INTL', 'school_code': None},
            {'name': 'Disability Support Services', 'code': 'DSS', 'school_code': None},
            {'name': 'eCampus Support', 'code': 'ECAMPUS', 'school_code': None},
        ]
        
        for data in groups_data:
            school = None
            if data.get('school_code'):
                school = next((s for s in school_objs if s.code == data['school_code']), None)
            group, created = AssignmentGroup.objects.get_or_create(
                code=data['code'], 
                defaults={
                    'name': data['name'], 
                    'school': school
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created group: {group.name}'))

        # ============================================================
        # MOCK USERS (100 users with diverse roles)
        # ============================================================
        roles = ['student', 'student', 'student', 'student', 'student',  # 5 students
                 'staff', 'staff', 'staff',                            # 3 staff
                 'faculty', 'faculty', 'faculty',                       # 3 faculty
                 'admin']                                               # 1 admin per set
        
        # Realistic first names and last names
        first_names = [
            'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 
            'David', 'Elizabeth', 'William', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 
            'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Margaret',
            'Anthony', 'Betty', 'Donald', 'Dorothy', 'Mark', 'Sandra', 'Paul', 'Ashley'
        ]
        
        last_names = [
            'Otieno', 'Wanjiku', 'Omondi', 'Akinyi', 'Muhammad', 'Njeri', 'Ochieng', 'Kamau',
            'Achieng', 'Mbugua', 'Onyango', 'Wambui', 'Okoth', 'Muthoni', 'Odhiambo', 'Kariuki',
            'Were', 'Mwikali', 'Awuor', 'Mwangi', 'Atieno', 'Njuguna', 'Auma', 'Maina',
            'Nyambura', 'Kipchoge', 'Chepkoech', 'Kiprop', 'Chemutai', 'Kipkemboi'
        ]
        
        # Create 100 users
        for i in range(1, 101):
            username = f'user{i:03d}'
            email = f'{username}@students.maseno.ac.ke' if i <= 70 else f'{username}@maseno.ac.ke'
            
            # Assign role based on index
            if i <= 70:
                role = 'student'
            elif i <= 85:
                role = 'staff'
            elif i <= 95:
                role = 'faculty'
            else:
                role = 'admin'
            
            # Select random school and department
            school = random.choice(school_objs)
            dept = Department.objects.filter(school=school).first()
            
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': role,
                    'school': school,
                    'department': dept,
                }
            )
            
            if created:
                user.set_password('password123')
                user.save()
                if i <= 70:
                    self.stdout.write(self.style.SUCCESS(f'Created student: {username} ({first_name} {last_name})'))
                elif i <= 85:
                    self.stdout.write(self.style.SUCCESS(f'Created staff: {username} ({first_name} {last_name})'))
                elif i <= 95:
                    self.stdout.write(self.style.SUCCESS(f'Created faculty: {username} ({first_name} {last_name})'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Created admin: {username} ({first_name} {last_name})'))

        # ============================================================
        # SUPERUSER
        # ============================================================
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@maseno.ac.ke',
                password='admin123',
                role='admin',
                first_name='System',
                last_name='Administrator',
            )
            self.stdout.write(self.style.SUCCESS('Created superuser: admin'))

        # ============================================================
        # CATEGORY TREE (Enhanced with more categories)
        # ============================================================
        from core.models import Category

        # Top-level categories
        it, _ = Category.objects.get_or_create(name="Information Technology", defaults={'is_active': True})
        facilities, _ = Category.objects.get_or_create(name="Facilities & Infrastructure", defaults={'is_active': True})
        academic, _ = Category.objects.get_or_create(name="Academic Services", defaults={'is_active': True})
        finance, _ = Category.objects.get_or_create(name="Finance & Fees", defaults={'is_active': True})
        library, _ = Category.objects.get_or_create(name="Library Services", defaults={'is_active': True})
        hr, _ = Category.objects.get_or_create(name="Human Resources", defaults={'is_active': True})
        health, _ = Category.objects.get_or_create(name="Health & Wellness", defaults={'is_active': True})
        admin, _ = Category.objects.get_or_create(name="Administrative Services", defaults={'is_active': True})

        # IT subcategories
        hardware, _ = Category.objects.get_or_create(name="Hardware", parent=it, defaults={'is_active': True})
        software, _ = Category.objects.get_or_create(name="Software", parent=it, defaults={'is_active': True})
        network, _ = Category.objects.get_or_create(name="Network & Wi-Fi", parent=it, defaults={'is_active': True})
        email, _ = Category.objects.get_or_create(name="Email & Accounts", parent=it, defaults={'is_active': True})
        systems, _ = Category.objects.get_or_create(name="Academic Systems", parent=it, defaults={'is_active': True})
        
        # Hardware subcategories
        printer, _ = Category.objects.get_or_create(name="Printer", parent=hardware, defaults={'is_active': True})
        laptop, _ = Category.objects.get_or_create(name="Laptop/Desktop", parent=hardware, defaults={'is_active': True})
        projector, _ = Category.objects.get_or_create(name="Projector", parent=hardware, defaults={'is_active': True})
        
        # Facilities subcategories
        electrical, _ = Category.objects.get_or_create(name="Electrical", parent=facilities, defaults={'is_active': True})
        plumbing, _ = Category.objects.get_or_create(name="Plumbing", parent=facilities, defaults={'is_active': True})
        building, _ = Category.objects.get_or_create(name="Building & Construction", parent=facilities, defaults={'is_active': True})
        grounds, _ = Category.objects.get_or_create(name="Grounds & Landscaping", parent=facilities, defaults={'is_active': True})
        
        # Academic subcategories
        registration, _ = Category.objects.get_or_create(name="Course Registration", parent=academic, defaults={'is_active': True})
        advising, _ = Category.objects.get_or_create(name="Academic Advising", parent=academic, defaults={'is_active': True})
        transcript, _ = Category.objects.get_or_create(name="Transcripts", parent=academic, defaults={'is_active': True})
        exams, _ = Category.objects.get_or_create(name="Examinations", parent=academic, defaults={'is_active': True})
        
        # Finance subcategories
        fees, _ = Category.objects.get_or_create(name="Tuition Fees", parent=finance, defaults={'is_active': True})
        scholarships, _ = Category.objects.get_or_create(name="Scholarships", parent=finance, defaults={'is_active': True})
        payments, _ = Category.objects.get_or_create(name="Payment Issues", parent=finance, defaults={'is_active': True})
        
        # Library subcategories
        books, _ = Category.objects.get_or_create(name="Book Loans", parent=library, defaults={'is_active': True})
        eresources, _ = Category.objects.get_or_create(name="E-Resources", parent=library, defaults={'is_active': True})
        study_rooms, _ = Category.objects.get_or_create(name="Study Rooms", parent=library, defaults={'is_active': True})
        
        # HR subcategories
        leave, _ = Category.objects.get_or_create(name="Leave Application", parent=hr, defaults={'is_active': True})
        payslip, _ = Category.objects.get_or_create(name="Payslip Issues", parent=hr, defaults={'is_active': True})
        recruitment, _ = Category.objects.get_or_create(name="Recruitment", parent=hr, defaults={'is_active': True})
        
        # Health subcategories
        clinic, _ = Category.objects.get_or_create(name="University Clinic", parent=health, defaults={'is_active': True})
        counselling, _ = Category.objects.get_or_create(name="Counselling Services", parent=health, defaults={'is_active': True})
        insurance, _ = Category.objects.get_or_create(name="Medical Insurance", parent=health, defaults={'is_active': True})
        
        # Administrative subcategories
        id_card, _ = Category.objects.get_or_create(name="Student/Staff ID Card", parent=admin, defaults={'is_active': True})
        accommodation, _ = Category.objects.get_or_create(name="Accommodation", parent=admin, defaults={'is_active': True})
        security, _ = Category.objects.get_or_create(name="Security Issues", parent=admin, defaults={'is_active': True})
        
        self.stdout.write(self.style.SUCCESS('Created comprehensive category tree with 30+ categories'))

        # ============================================================
        # ASSIGN AGENTS TO GROUPS (Link some users to groups)
        # ============================================================
        # Get IT support group and add IT staff/faculty
        it_group = AssignmentGroup.objects.filter(code='IT-HD').first()
        if it_group:
            it_users = User.objects.filter(
                school__code='COMP', 
                role__in=['staff', 'faculty', 'admin']
            )[:10]
            it_group.members.add(*it_users)
            self.stdout.write(f'Added {it_users.count()} members to {it_group.name}')
        
        # Get Facilities group and add staff from AGRI
        fac_group = AssignmentGroup.objects.filter(code='FAC-MAIN').first()
        if fac_group:
            fac_users = User.objects.filter(role__in=['staff', 'admin'])[:8]
            fac_group.members.add(*fac_users)
            self.stdout.write(f'Added {fac_users.count()} members to {fac_group.name}')
        
        # Get Academic Advising groups
        adv_groups = AssignmentGroup.objects.filter(code__startswith='ADV-')
        for group in adv_groups:
            school_code = group.code.split('-')[1] if '-' in group.code else None
            if school_code:
                users = User.objects.filter(school__code=school_code, role__in=['faculty', 'staff'])[:5]
                group.members.add(*users)
                self.stdout.write(f'Added {users.count()} members to {group.name}')
        
        self.stdout.write(self.style.SUCCESS('\n========================================'))
        self.stdout.write(self.style.SUCCESS('Mock data creation complete!'))
        self.stdout.write(self.style.SUCCESS(f'Created {School.objects.count()} schools'))
        self.stdout.write(self.style.SUCCESS(f'Created {Department.objects.count()} departments'))
        self.stdout.write(self.style.SUCCESS(f'Created {AssignmentGroup.objects.count()} assignment groups'))
        self.stdout.write(self.style.SUCCESS(f'Created {User.objects.count()} users'))
        self.stdout.write(self.style.SUCCESS(f'Created {Category.objects.count()} categories'))
        self.stdout.write(self.style.SUCCESS('========================================'))