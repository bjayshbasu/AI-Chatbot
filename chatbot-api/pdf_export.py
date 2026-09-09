from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER

def create_pdf(title, content, output_path):
    styles = getSampleStyleSheet()

    title_style = styles["Title"]
    title_style.alignment = TA_CENTER

    heading = styles["Heading2"]
    body = styles["BodyText"]

    doc = SimpleDocTemplate(output_path)
    story = []

    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 20))

    sections = content.split("### ")

    for section in sections:
        if not section.strip():
            continue

        lines = section.split("\n", 1)
        heading_text = lines[0]
        body_text = lines[1] if len(lines) > 1 else ""

        story.append(Paragraph(heading_text, heading))
        story.append(Paragraph(body_text.replace("\n", "<br/>"), body))
        story.append(Spacer(1, 12))

    doc.build(story)

    return output_path