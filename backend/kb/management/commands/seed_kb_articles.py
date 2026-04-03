# knowledgebase/management/commands/seed_kb_articles.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Category
from kb.models import Article

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the knowledge base with comprehensive articles'

    def handle(self, *args, **options):
        # Ensure categories exist
        categories = {}
        cat_names = [
            'IT Support',
            'Facilities',
            'Academic Advising',
            'Financial Aid',
            'Library Services',
            'Human Resources',
            'Campus Information',
        ]
        for name in cat_names:
            # Prefer existing top-level active category, else create new top-level
            cat = Category.objects.filter(
                name__iexact=name, 
                parent__isnull=True, 
                is_active=True
            ).first()
            if not cat:
                cat, created = Category.objects.get_or_create(
                    name=name, 
                    parent=None,
                    defaults={'is_active': True}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created category: {name}'))
            else:
                created = False
                self.stdout.write(f'Using existing category: {name}')
            categories[name] = cat

        # Get an admin user (or create a dummy one)
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            admin = User.objects.filter(role='admin').first()
        if not admin:
            admin = User.objects.create_user(
                username='kb_admin',
                password='changeme123',
                role='admin',
                email='kb_admin@example.com'
            )
            self.stdout.write('Created admin user for KB articles.')

        # List of articles: each is a dict with fields
        articles = [
            # IT Support
            {
                'title': 'How to Reset Your University Password',
                'content': """
# How to Reset Your University Password

If you have forgotten your password or it has expired, follow these steps:

1. Go to the [Password Reset Portal](https://password.maseno.ac.ke).
2. Enter your **Student ID** or **Staff Username**.
3. Click **"Send Reset Link"**.
4. Check your registered email inbox for a message from `it-support@maseno.ac.ke`.
5. Click the secure link in the email (valid for 15 minutes).
6. Create a new password that meets the requirements:
   - At least 8 characters
   - Contains uppercase and lowercase letters
   - Contains at least one number
   - Contains at least one special character (!@#$%^&*)
7. Confirm the new password and submit.

**If you don't receive the email:**
- Check your spam/junk folder.
- Wait a few minutes and try again.
- Contact the IT Helpdesk at `helpdesk@maseno.ac.ke` or visit the ICT Centre.

> **Note:** Password changes take effect immediately. Remember to update your password on all your devices (laptop, phone, tablet).
""",
                'excerpt': 'Step-by-step guide to resetting your forgotten or expired university password.',
                'category': 'IT Support',
            },
            {
                'title': 'Connecting to Campus Wi-Fi (eduroam)',
                'content': """
# Connecting to Campus Wi-Fi (eduroam)

Maseno University provides **eduroam** wireless network for students, faculty, and staff. Follow these instructions to connect.

## For Windows 10/11
1. Click the Wi-Fi icon in the system tray.
2. Select **eduroam** from the list of networks.
3. When prompted, enter:
   - Username: `yourusername@maseno.ac.ke` (e.g., `jdoe001@maseno.ac.ke`)
   - Password: your university password
4. Click **Connect**.
5. Accept the security certificate if prompted.

## For macOS
1. Click the Wi-Fi icon in the menu bar.
2. Choose **eduroam**.
3. Enter your credentials:
   - Username: `yourusername@maseno.ac.ke`
   - Password: your password
4. Click **Join**.
5. If a certificate warning appears, click **Continue** or **Trust**.

## For Android/iOS
1. Open **Settings** → **Wi-Fi**.
2. Tap **eduroam**.
3. In the **EAP method** select **PEAP**.
4. In **Phase 2 authentication** select **MSCHAPV2**.
5. For **CA certificate** select **Do not validate** (or install the university root certificate if required).
6. Identity: `yourusername@maseno.ac.ke`
7. Password: your password
8. Tap **Connect**.

**Troubleshooting:**
- Ensure you use the full email address as the username.
- If you recently changed your password, try forgetting the network and reconnecting.
- For persistent issues, contact the IT Helpdesk.
""",
                'excerpt': 'Instructions for connecting to eduroam Wi‑Fi on various devices.',
                'category': 'IT Support',
            },
            {
                'title': 'How to Install University Licensed Software',
                'content': """
# How to Install University Licensed Software

Students and staff can download and install various software titles for free or at a discounted rate through the university’s software portal.

## Available Software
- Microsoft Office 365 (Word, Excel, PowerPoint, Teams)
- MATLAB
- SPSS
- Adobe Creative Cloud (limited licenses)
- Antivirus (Sophos, Microsoft Defender)
- EndNote
- SPSS

## Installation Steps
1. Visit the [Software Download Portal](https://software.maseno.ac.ke).
2. Log in using your university credentials.
3. Browse or search for the desired software.
4. Follow the on‑screen instructions to download the installer.
5. Run the installer and follow the prompts.

**For Microsoft Office 365:**
- After logging in, select **Office 365**.
- Click **Install Office** → **Microsoft 365 Apps**.
- Run the downloaded installer – it will automatically activate with your university account.

**For SPSS/Other Specialized Software:**
- Some titles may require a license key, which is provided on the download page.
- Keep the installer and key for future reinstallations.

If you encounter any errors, contact the IT Helpdesk with a screenshot of the issue.
""",
                'excerpt': 'Guide to downloading and installing software available through the university.',
                'category': 'IT Support',
            },
            # Facilities
            {
                'title': 'How to Book a Study Room',
                'content': """
# How to Book a Study Room

The library offers group study rooms that can be reserved online. Here’s how:

1. Go to the [Library Booking System](https://library.maseno.ac.ke/booking).
2. Log in with your university email and password.
3. Select the **Library** and then **Study Rooms**.
4. Choose a date and time slot (maximum 2 hours per day).
5. If you are booking for a group, enter the number of participants.
6. Confirm your booking. You will receive an email confirmation.

**Rules:**
- Rooms are available from 8:00 AM to 10:00 PM.
- You can book up to 7 days in advance.
- Cancellations must be made at least 1 hour before the start time, or you may be marked as a no‑show.
- Three no‑shows will result in a temporary ban from booking.

For any issues, contact the Library Help Desk at `library@maseno.ac.ke`.
""",
                'excerpt': 'Instructions for reserving group study rooms in the library.',
                'category': 'Facilities',
            },
            {
                'title': 'Reporting a Facilities Issue (Maintenance Request)',
                'content': """
# Reporting a Facilities Issue

If you encounter a problem such as a broken light, leaking tap, faulty air conditioner, or any other maintenance issue, please submit a ticket through the CUTS system.

## Steps to Report
1. Log in to the CUTS portal.
2. Click on **Create Ticket**.
3. Select category: **Facilities**.
4. Choose the appropriate sub‑category (e.g., Electrical, Plumbing, HVAC).
5. Provide a clear description of the issue and its exact location (building, floor, room number).
6. Attach photos if possible – this helps the maintenance team assess the problem.
7. Submit the ticket.

**What happens next?**
- Your ticket will be assigned to the Facilities team.
- You will receive updates via email and the portal.
- Urgent issues (e.g., electrical hazards, flooding) will be prioritised.

**For emergencies** (e.g., fire, gas leak, major water leak), call the Facilities Emergency Hotline: **+254 700 123 456** immediately.
""",
                'excerpt': 'How to submit maintenance requests for facilities-related problems.',
                'category': 'Facilities',
            },
            # Academic Advising
            {
                'title': 'How to Request an Official Transcript',
                'content': """
# How to Request an Official Transcript

Current students and alumni can request official transcripts from the Registrar’s Office.

## Online Request Process
1. Visit the [Registrar’s Portal](https://registrar.maseno.ac.ke).
2. Log in with your student credentials.
3. Click on **Transcript Request**.
4. Select the number of copies and the delivery method:
   - **Pick up at Registrar’s Office** (free)
   - **Postal delivery** (fee applies)
   - **Email (PDF)** (free, but note: some employers require sealed official copies)
5. Pay the required fee via e‑Citizen if applicable.
6. Submit the request. You will receive a confirmation email.

**Processing Time:**
- Regular requests: 5–7 business days.
- Expedited requests: 2–3 business days (additional fee).

**For Alumni who cannot access the portal:**
Email `registrar@maseno.ac.ke` with your full name, student ID, year of graduation, and number of copies needed. Include proof of identity.

For further assistance, visit the Registrar’s Office during working hours.
""",
                'excerpt': 'Step-by-step guide for requesting official academic transcripts.',
                'category': 'Academic Advising',
            },
            {
                'title': 'Course Registration Guide',
                'content': """
# Course Registration Guide

Registering for courses each semester is done online through the Student Portal. Follow these steps:

## Before Registration
- Check your **Academic Calendar** for registration dates.
- Consult your academic advisor to ensure you meet prerequisites and degree requirements.
- Clear any outstanding fees or library fines – holds will block registration.

## Registration Steps
1. Log in to the [Student Portal](https://student.maseno.ac.ke).
2. Go to **Academics** → **Course Registration**.
3. Select the semester and academic year.
4. Browse available courses or search by code.
5. Add courses to your cart – check for time conflicts.
6. Review your selected courses and click **Submit Registration**.
7. Print or save your registration confirmation.

**After Registration:**
- Verify your schedule in the portal.
- Attend the first week of classes; instructors will take attendance.
- You can add/drop courses during the **add/drop period** (first two weeks of semester).

## Problems?
- If a course is full, check for waitlist options or contact the department.
- For system errors, email `it-support@maseno.ac.ke` with a screenshot.
- For academic issues, see your faculty advisor.

> **Note:** Late registration may incur a penalty fee. Register on time!
""",
                'excerpt': 'Complete guide to registering for courses each semester.',
                'category': 'Academic Advising',
            },
            # Financial Aid
            {
                'title': 'Applying for Scholarships and Bursaries',
                'content': """
# Applying for Scholarships and Bursaries

Maseno University offers various scholarships and bursaries for eligible students. Here’s how to apply.

## Types of Aid
- **Merit‑Based Scholarships**: For students with outstanding academic performance.
- **Need‑Based Bursaries**: For students from disadvantaged backgrounds.
- **Government Loans**: Higher Education Loans Board (HELB) for Kenyan students.
- **External Scholarships**: Offered by organisations and foundations.

## Application Process
1. Visit the [Financial Aid Portal](https://finaid.maseno.ac.ke).
2. Log in with your student ID.
3. Complete the **General Application** form – this determines your eligibility for multiple programs.
4. Upload required documents:
   - Admission letter
   - Academic transcripts (for continuing students)
   - Income statements (for need‑based)
   - Recommendation letters (if required)
5. Submit the application by the deadline.

**Deadlines:**
- Semester 1: 31st July
- Semester 2: 30th November

**HELB Applications:**
- Kenyan students must apply separately via the [HELB portal](https://www.helb.co.ke).
- Ensure you have a valid KRA PIN and bank account.

For questions, visit the Financial Aid Office or email `finaid@maseno.ac.ke`.
""",
                'excerpt': 'Information on how to apply for scholarships, bursaries, and financial aid.',
                'category': 'Financial Aid',
            },
            {
                'title': 'How to Pay Tuition Fees Online',
                'content': """
# How to Pay Tuition Fees Online

Pay your tuition fees securely through the university’s online payment portal.

## Payment Methods
- **Visa/Mastercard** (credit/debit)
- **M‑PESA** (via Paybill)
- **Bank Transfer** (direct deposit)

## Steps to Pay Online
1. Log in to the [Student Portal](https://student.maseno.ac.ke).
2. Go to **Finance** → **Make a Payment**.
3. Enter the amount you wish to pay.
4. Select payment method:
   - **Card:** You will be redirected to a secure payment page. Enter card details.
   - **M‑PESA:** You will receive a prompt on your phone; enter your PIN to complete.
   - **Bank Transfer:** Download an invoice and use the bank details provided.
5. After successful payment, a receipt will be generated and sent to your email.

**M‑PESA Paybill Details:**
- Paybill Number: **123456**
- Account Number: Your **Student ID** (e.g., S1234567)

**Note:** Fees must be paid before the semester deadline to avoid registration holds. Allow 24 hours for the payment to reflect in your account.

If you encounter any issues, contact the Finance Office at `finance@maseno.ac.ke`.
""",
                'excerpt': 'Instructions for paying tuition fees via credit card, M‑PESA, or bank transfer.',
                'category': 'Financial Aid',
            },
            # Library Services
            {
                'title': 'Borrowing and Returning Books',
                'content': """
# Borrowing and Returning Books

The University Library offers a wide collection of books, journals, and other resources. Here’s how to borrow and return items.

## Borrowing
1. Browse the library catalog online: [Library Catalogue](https://library.maseno.ac.ke/catalogue).
2. Note the **call number** and location of the book.
3. Visit the library and find the book on the shelves.
4. Take the book to the **Circulation Desk** with your student/staff ID.
5. The librarian will scan your ID and the book – you will receive a due date slip.

**Loan Periods:**
- Undergraduates: 2 weeks (renewable twice)
- Postgraduates: 4 weeks (renewable twice)
- Staff: 8 weeks (renewable twice)

## Renewals
- You can renew books online via the library portal or in person.
- Log in to your library account, select the items, and click **Renew**.
- Renewals are subject to no holds by other users.

## Returning
- Return books at the **Circulation Desk** or use the **book drop** outside the library when closed.
- Late returns incur a fine of **KSh 50 per day** per book.

## Lost or Damaged Books
- Report lost books immediately. You may be required to pay the replacement cost plus a processing fee.

For assistance, email `library@maseno.ac.ke` or visit the Information Desk.
""",
                'excerpt': 'Policies and procedures for borrowing and returning library materials.',
                'category': 'Library Services',
            },
            {
                'title': 'Accessing E‑Resources (Journals, Databases)',
                'content': """
# Accessing E‑Resources (Journals, Databases)

The library subscribes to numerous electronic resources, including academic journals, e‑books, and research databases.

## How to Access
1. Visit the [Library E‑Resources Portal](https://library.maseno.ac.ke/eresources).
2. Browse or search for the resource you need (e.g., JSTOR, ScienceDirect, ProQuest).
3. Click on the resource link – you will be prompted to log in with your university credentials if off‑campus.
4. Once authenticated, you can search and download articles.

**Off‑Campus Access:**
- Use your university email and password.
- If prompted for a **proxy** or **VPN**, follow the instructions on the library website.

**Troubleshooting:**
- Clear your browser cache if you encounter login loops.
- Try a different browser (Chrome/Firefox recommended).
- Contact the library at `eresources@maseno.ac.ke` for access issues.

> **Note:** Many resources have limited concurrent users. Log out when finished.
""",
                'excerpt': 'Guide to accessing online journals, e‑books, and research databases.',
                'category': 'Library Services',
            },
            # Human Resources (Staff)
            {
                'title': 'How to Apply for Leave (Staff)',
                'content': """
# How to Apply for Leave (Staff)

Staff members can apply for annual leave, sick leave, or other types of leave through the HR portal.

## Steps
1. Log in to the [Staff Portal](https://staff.maseno.ac.ke).
2. Go to **HR Services** → **Leave Application**.
3. Select the leave type:
   - **Annual Leave**
   - **Sick Leave** (medical certificate required if >2 days)
   - **Maternity/Paternity Leave**
   - **Study Leave**
   - **Compassionate Leave**
4. Enter the start and end dates, and provide a reason.
5. If required, upload supporting documents (e.g., medical certificate).
6. Submit – the application will be routed to your supervisor for approval.

**Leave Balances:**
- You can view your remaining leave days on the dashboard.

**Approval Process:**
- Your supervisor will receive an email notification to approve or reject.
- You will be notified of the decision via email and the portal.

For urgent leave, contact HR directly.

For questions, email `hr@maseno.ac.ke`.
""",
                'excerpt': 'Instructions for staff to apply for leave through the HR system.',
                'category': 'Human Resources',
                'audience': 'staff',
            },
            {
                'title': 'Understanding Your Payslip',
                'content': """
# Understanding Your Payslip

Your monthly payslip contains important information about your earnings and deductions. Here’s a breakdown.

## How to Access Your Payslip
- Log in to the [Staff Portal](https://staff.maseno.ac.ke).
- Go to **Finance** → **My Payslips**.
- Select the month/year to view or download.

## Key Sections
- **Basic Salary**: Your base pay.
- **Allowances**: House, commuter, hardship, etc.
- **Gross Pay**: Basic + allowances.
- **Deductions**:
  - PAYE (Income Tax)
  - NHIF (National Hospital Insurance Fund)
  - NSSF (National Social Security Fund)
  - SACCO contributions (if applicable)
  - Loan repayments (if any)
- **Net Pay**: Gross Pay – Deductions = amount deposited to your bank.

**If you notice discrepancies:**
- Check with your department’s HR representative.
- Email payroll@maseno.ac.ke with your staff ID and details.

**Note:** Payslips are generated by the 5th of each month. If you don’t see yours by the 7th, contact the Finance Office.
""",
                'excerpt': 'Explanation of payslip components and how to access them online.',
                'category': 'Human Resources',
            },
            # Campus Information
            {
                'title': 'Campus Map and Directions',
                'content': """
# Campus Map and Directions

Maseno University’s main campus is located along the Kisumu‑Busia road. Here’s how to find key locations.

## Interactive Map
- Visit the [Campus Map](https://maps.maseno.ac.ke) for an interactive guide with building names and departments.

## Key Landmarks
- **Administration Block**: Main offices, Vice Chancellor’s office.
- **Library**: Central library with study spaces.
- **Student Centre**: Cafeteria, student affairs offices.
- **ICT Centre**: Computer labs, IT support.
- **School of Agriculture**: Farms and labs.
- **School of Medicine**: Teaching hospital, lecture theatres.

## Getting Around
- **Walking**: Most facilities are within walking distance.
- **Shuttle**: A university shuttle runs between the main campus and town every hour.
- **Taxis**: Available at the main gate.

## Parking
- Staff and student parking lots are designated. Display your permit.
- Visitor parking is available near the Administration Block.

For security assistance, call Campus Security: **+254 700 123 789**.
""",
                'excerpt': 'Map and directions to help navigate the university campus.',
                'category': 'Campus Information',
            },
            {
                'title': 'Academic Calendar 2026',
                'content': """
# Academic Calendar 2026

Important dates for the 2026 academic year.

## Semester 1 (January – April)
- **Registration**: 5–16 January
- **Classes Begin**: 19 January
- **Add/Drop Period**: 19 January – 30 January
- **Mid‑Semester Exams**: 2–6 March
- **Revision Week**: 23–27 March
- **End‑of‑Semester Exams**: 30 March – 10 April
- **Semester Break**: 13 April – 1 May

## Semester 2 (May – August)
- **Registration**: 4–15 May
- **Classes Begin**: 18 May
- **Add/Drop Period**: 18 May – 29 May
- **Mid‑Semester Exams**: 29 June – 3 July
- **Revision Week**: 20–24 July
- **End‑of‑Semester Exams**: 27 July – 7 August
- **Semester Break**: 10 August – 4 September

## Semester 3 (September – December)
- **Registration**: 7–18 September
- **Classes Begin**: 21 September
- **Add/Drop Period**: 21 September – 2 October
- **Mid‑Semester Exams**: 26–30 October
- **Revision Week**: 16–20 November
- **End‑of‑Semester Exams**: 23 November – 4 December
- **Year‑End Break**: 7 December onwards

## Public Holidays
- **Labour Day**: 1 May
- **Madaraka Day**: 1 June
- **Mashujaa Day**: 20 October
- **Jamhuri Day**: 12 December
- **Christmas**: 25–26 December

> Note: Dates are subject to change. Always check the official university website for updates.
""",
                'excerpt': 'Important academic dates for the 2026 academic year.',
                'category': 'Campus Information',
            },
        ]

        # Create articles
        for art in articles:
            cat = categories[art['category']]
            article, created = Article.objects.get_or_create(
                title=art['title'],
                defaults={
                    'content': art['content'],
                    'excerpt': art['excerpt'],
                    'category': cat,
                    'author': admin,
                    'audience': art.get('audience', 'all'),
                    'is_published': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created article: {art["title"]}'))
            else:
                self.stdout.write(f'Article already exists: {art["title"]}')