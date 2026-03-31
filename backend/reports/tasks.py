from celery import shared_task
import csv
import io
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from tickets.models import Ticket


@shared_task
def generate_csv_report(start_date, end_date, report_type):
    queryset = Ticket.objects.filter(created_at__range=[start_date, end_date])
    
    output = io.StringIO()
    fieldnames = ['ID', 'Title', 'Status', 'Priority', 'Created At', 'Resolved At']
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    for ticket in queryset:
        writer.writerow({
            'ID': ticket.id,
            'Title': ticket.title[:100],
            'Status': ticket.get_status_display(),
            'Priority': ticket.get_priority_display(),
            'Created At': ticket.created_at.isoformat(),
            'Resolved At': ticket.resolved_at.isoformat() if ticket.resolved_at else '',
        })
    
    return output.getvalue()


@shared_task
def generate_pdf_report(start_date, end_date, report_type):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    p.drawString(100, height - 100, f"Tickets Report ({start_date} to {end_date})")
    p.drawString(100, height - 130, f"Report Type: {report_type.upper()}")
    
    y = height - 200
    tickets = Ticket.objects.filter(created_at__range=[start_date, end_date])[:50]  # Limit for demo
    
    p.setFont("Helvetica-Bold", 10)
    p.drawString(50, y, "ID | Title | Status | Priority | Created")
    y -= 20
    
    p.setFont("Helvetica", 9)
    for ticket in tickets:
        line = f"{ticket.id} | {ticket.title[:30]} | {ticket.status} | {ticket.priority} | {ticket.created_at.strftime('%Y-%m-%d')}"
        if y < 100:
            p.showPage()
            y = height - 100
        p.drawString(50, y, line)
        y -= 15
    
    p.save()
    buffer.seek(0)
    return buffer.getvalue()

