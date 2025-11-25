import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface ApplicationData {
    full_name: string;
    reference_number: string;
    position: string;
    department: string;
    passport_url?: string; // We might not be able to put the actual image if CORS blocks it, but we can try or just put a placeholder
    date_of_birth: string;
    state_of_origin: string;
}

export const generateSlip = async (data: ApplicationData) => {
    const doc = new jsPDF();

    // -- Header --
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 95); // #1e3a5f
    doc.text("Kashim Ibrahim University", 105, 20, { align: "center" });
    doc.text("Teaching Hospital", 105, 30, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(74, 157, 126); // #4a9d7e
    doc.text("Recruitment Application Slip", 105, 45, { align: "center" });

    // -- Photo Placeholder --
    // Note: Loading remote images into jsPDF can be tricky due to CORS. 
    // For now, we'll draw a box.
    doc.setDrawColor(200, 200, 200);
    doc.rect(150, 55, 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Passport", 170, 75, { align: "center" });

    // -- Applicant Details --
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let y = 60;
    const lineHeight = 10;

    const addField = (label: string, value: string) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, 70, y);
        y += lineHeight;
    };

    addField("Reference Number", data.reference_number);
    addField("Full Name", data.full_name);
    addField("Position Applied", data.position);
    addField("Department", data.department);
    addField("State of Origin", data.state_of_origin);
    addField("Date of Birth", data.date_of_birth);
    addField("Date Applied", new Date().toLocaleDateString());

    // -- QR Code --
    try {
        // Generate QR code containing the reference number and name
        const qrData = `KIUTH Recruitment\nRef: ${data.reference_number}\nName: ${data.full_name}\nPosition: ${data.position}`;
        const qrDataUrl = await QRCode.toDataURL(qrData);
        doc.addImage(qrDataUrl, 'PNG', 20, y + 10, 40, 40);
    } catch (err) {
        console.error("Error generating QR code", err);
    }

    // -- Footer --
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Please bring this slip to the interview venue.", 105, 280, { align: "center" });

    // -- Save --
    doc.save(`KIUTH_Application_${data.reference_number}.pdf`);
};
