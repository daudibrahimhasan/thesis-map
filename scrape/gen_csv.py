import json, csv
from pathlib import Path

FACULTY_JSON = Path(__file__).parent.parent / "frontend/src/data/faculty.json"
fac = json.loads(FACULTY_JSON.read_text(encoding="utf-8"))

SKIP = {'-', '.', 'Interests', 'Current Interest upon topics :', 'Recent works by undergrad groups with me', 'Prediction of traffic status in near future.'}
all_areas = set()
for f in fac:
    for a in f.get("researchAreas", []):
        if a.strip() and a.strip() not in SKIP:
            all_areas.add(a.strip())

MAPPING = {
    # AI & Machine Learning
    "AI": ("Artificial Intelligence", "AI & Machine Learning"),
    "AI/ML": ("AI / Machine Learning", "AI & Machine Learning"),
    "Artificial Intelligence": ("Artificial Intelligence", "AI & Machine Learning"),
    "Artificial Intelligence (AI)": ("Artificial Intelligence", "AI & Machine Learning"),
    "Artificial Intelligence and Green AI": ("Artificial Intelligence & Green AI", "AI & Machine Learning"),
    "Artificial Intelligence & Data Science": ("Artificial Intelligence", "AI & Machine Learning"),
    "Applied Machine Learning": ("Machine Learning", "AI & Machine Learning"),
    "Applied Machine Learning and Data Science": ("Machine Learning", "AI & Machine Learning"),
    "Brain-Inspired AI": ("Brain-Inspired AI", "AI & Machine Learning"),
    "Causal AI": ("Causal AI", "AI & Machine Learning"),
    "Causal Inference": ("Causal Inference", "AI & Machine Learning"),
    "Classical AI": ("Classical AI", "AI & Machine Learning"),
    "Machine Learning": ("Machine Learning", "AI & Machine Learning"),
    "Machine Learning and AI": ("Machine Learning", "AI & Machine Learning"),
    "Machine Learning and Deep Learning": ("Machine Learning & Deep Learning", "AI & Machine Learning"),
    "Machine Learning (Applications and Ethics)": ("Machine Learning (Ethics & Applications)", "AI & Machine Learning"),
    "Machine Learning, \xa0Computer Vision": ("Machine Learning", "AI & Machine Learning"),
    "Machine Vision": ("Machine Vision", "AI & Machine Learning"),
    "ML & Data Science": ("Machine Learning & Data Science", "AI & Machine Learning"),
    "Multimodal AI": ("Multimodal AI", "AI & Machine Learning"),
    "Multi-Modal AI": ("Multimodal AI", "AI & Machine Learning"),
    "Multi-modal Learning": ("Multimodal Learning", "AI & Machine Learning"),
    "Multimodal Learning": ("Multimodal Learning", "AI & Machine Learning"),
    "Optimization": ("Optimization", "AI & Machine Learning"),
    "Optimization and Metaheuristic Algorithms": ("Optimization & Metaheuristics", "AI & Machine Learning"),
    "Meta-Heuristics": ("Metaheuristics", "AI & Machine Learning"),
    "Reinforcement Learning": ("Reinforcement Learning", "AI & Machine Learning"),
    "Transfer Learning": ("Transfer Learning", "AI & Machine Learning"),
    "Knowledge Distillation": ("Knowledge Distillation", "AI & Machine Learning"),
    "RLHF and Agentic Workflows": ("RLHF & Agentic Workflows", "AI & Machine Learning"),
    "Federated Learning": ("Federated Learning", "AI & Machine Learning"),
    "Distributed Machine Learning": ("Distributed Machine Learning", "AI & Machine Learning"),
    "Spiking Neural Networks (SNN)": ("Spiking Neural Networks", "AI & Machine Learning"),
    "Deep learning, Spiking neural networks": ("Deep Learning & Spiking Neural Networks", "AI & Machine Learning"),
    "Machine Learning in Power Systems": ("ML in Power Systems", "AI & Machine Learning"),
    "1. Machine Learning in Computational Astrophysics": ("ML in Astrophysics", "AI & Machine Learning"),
    "2. Physics Informed Neural Network3. Quantum Machine Learning": ("Physics-Informed Neural Networks", "AI & Machine Learning"),

    # Deep Learning
    "Deep Learning": ("Deep Learning", "Deep Learning"),

    # Computer Vision
    "Computer Vision": ("Computer Vision", "Computer Vision"),
    "Computer Vision and Image Analysis": ("Computer Vision & Image Analysis", "Computer Vision"),
    "Image Processing": ("Image Processing", "Computer Vision"),
    "Image Processing & Computer Vision": ("Image Processing & Computer Vision", "Computer Vision"),
    "Image Processing and Computer Vision": ("Image Processing & Computer Vision", "Computer Vision"),
    "Image Segmentation": ("Image Segmentation", "Computer Vision"),
    "Image Generation": ("Image Generation", "Computer Vision"),
    "Image Restoration/Image Enhancement": ("Image Restoration & Enhancement", "Computer Vision"),
    "Object Recognition": ("Object Recognition", "Computer Vision"),
    "Scene Understanding": ("Scene Understanding", "Computer Vision"),
    "Video/Scene Understanding": ("Video & Scene Understanding", "Computer Vision"),
    "Histopathological Image Classification": ("Histopathological Image Classification", "Computer Vision"),
    "Generative Models": ("Generative Models", "Computer Vision"),
    "Medical Image Analysis": ("Medical Image Analysis", "Computer Vision"),
    "Medical Image Processing, Mental Health": ("Medical Image Processing", "Computer Vision"),
    "Medical Image and Data Analytics": ("Medical Image Analytics", "Computer Vision"),
    "Vision-based AI": ("Vision-based AI", "Computer Vision"),
    "Vision-based Automation": ("Vision-based Automation", "Computer Vision"),
    "AI, Image Processing and Computer Vision": ("Image Processing & Computer Vision", "Computer Vision"),
    "3D Image Processing": ("3D Image Processing", "Computer Vision"),
    "Natural Language ProcessingImage Processing": ("Image Processing", "Computer Vision"),

    # NLP
    "NLP": ("Natural Language Processing", "NLP"),
    "NLP Applications": ("NLP Applications", "NLP"),
    "NLP for Education": ("NLP for Education", "NLP"),
    "Natural Language Processing": ("Natural Language Processing", "NLP"),
    "Natural Language Processing (NLP)": ("Natural Language Processing", "NLP"),
    "Applied Natural Language Processing (NLP)": ("Applied NLP", "NLP"),
    "Low-resource Language": ("Low-resource Language NLP", "NLP"),
    "Machine Learning for NLP": ("ML for NLP", "NLP"),
    "Information Extraction": ("Information Extraction", "NLP"),
    "Information Retrieval": ("Information Retrieval", "NLP"),
    "Natural Language ProcessingMental Health Informatics": ("NLP for Mental Health", "NLP"),
    "Computational Social Science": ("Computational Social Science", "NLP"),
    "Social Media Sentiment AnalysisMalware and Intrusion Study": ("Sentiment Analysis", "NLP"),
    "AI, Cloud computing, NLP": ("Natural Language Processing", "NLP"),

    # Large Language Models
    "Large Language Models": ("Large Language Models", "Large Language Models"),
    "Trustworthy LLMs": ("Trustworthy LLMs", "Large Language Models"),
    "Trustworthy Large Language Models": ("Trustworthy LLMs", "Large Language Models"),
    "Retrieval Augmented Generation": ("Retrieval Augmented Generation (RAG)", "Large Language Models"),
    "Secure & Interpretable LLMs for Communication Protocols (5G and beyond)": ("Secure LLMs for 5G Protocols", "Large Language Models"),
    "LLM for Software Engineering (LLM4SE)": ("LLM for Software Engineering", "Large Language Models"),
    "Large Language Models for Security": ("LLMs for Security", "Large Language Models"),
    "ML, LLM, NLP, Cryptography": ("Large Language Models", "Large Language Models"),
    "Computer Vision, LLM, NLP": ("Large Language Models", "Large Language Models"),
    "Computer Vision,NLP, AI, ML": ("Large Language Models", "Large Language Models"),

    # Data Science
    "Data Science": ("Data Science", "Data Science"),
    "Data Mining": ("Data Mining", "Data Science"),
    "Data Mining Algorithms": ("Data Mining Algorithms", "Data Science"),
    "Financial Market Analysis": ("Financial Market Analysis", "Data Science"),
    "Human Analytics": ("Human Analytics", "Data Science"),
    "Social Computing": ("Social Computing", "Data Science"),
    "Education Technology": ("Education Technology", "Data Science"),
    "Data-centric Astronomy": ("Data-centric Astronomy", "Data Science"),
    "Computational Astrophysics": ("Computational Astrophysics", "Data Science"),

    # Security & Privacy
    "Security": ("Security", "Security & Privacy"),
    "Cybersecurity": ("Cybersecurity", "Security & Privacy"),
    "Cyber Security": ("Cybersecurity", "Security & Privacy"),
    "Security & Cybersecurity": ("Cybersecurity", "Security & Privacy"),
    "Security Analysis": ("Security Analysis", "Security & Privacy"),
    "Security and Privacy": ("Security & Privacy", "Security & Privacy"),
    "Security Usability": ("Security Usability", "Security & Privacy"),
    "Privacy Usability": ("Privacy Usability", "Security & Privacy"),
    "Usable Privacy and Security": ("Usable Privacy & Security", "Security & Privacy"),
    "Information Security": ("Information Security", "Security & Privacy"),
    "Information SecurityArtificial IntelligenceNLP": ("Information Security", "Security & Privacy"),
    "Cloud Security": ("Cloud Security", "Security & Privacy"),
    "IoT Security": ("IoT Security", "Security & Privacy"),
    "Cryptography": ("Cryptography", "Security & Privacy"),
    "Blockchain": ("Blockchain", "Security & Privacy"),
    "Blockchain and Cyber Security": ("Blockchain & Cybersecurity", "Security & Privacy"),
    "Blockchain and Distributed Systems": ("Blockchain & Distributed Systems", "Security & Privacy"),
    "Self-sovereign Identity (SSI)": ("Self-sovereign Identity (SSI)", "Security & Privacy"),
    "Trust": ("Trust", "Security & Privacy"),
    "Threat Intelligence": ("Threat Intelligence", "Security & Privacy"),
    "AI in Security": ("AI in Security", "Security & Privacy"),
    "Security for AI": ("Security for AI", "Security & Privacy"),
    "Computer and Network Security": ("Computer & Network Security", "Security & Privacy"),
    "Networks and Security": ("Networks & Security", "Security & Privacy"),
    "Machine Learning for Security": ("ML for Security", "Security & Privacy"),
    "Software Security": ("Software Security", "Security & Privacy"),

    # Bioinformatics & Healthcare
    "Bioinformatics": ("Bioinformatics", "Bioinformatics & Healthcare"),
    "Bioinformatics and Computational Biology": ("Bioinformatics & Computational Biology", "Bioinformatics & Healthcare"),
    "Computational Biology": ("Computational Biology", "Bioinformatics & Healthcare"),
    "Healthcare & Bio": ("Healthcare & Bioinformatics", "Bioinformatics & Healthcare"),
    "Healthcare Applications": ("Healthcare Applications", "Bioinformatics & Healthcare"),
    "Machine Learning for Healthcare": ("ML for Healthcare", "Bioinformatics & Healthcare"),
    "Biomedical AI": ("Biomedical AI", "Bioinformatics & Healthcare"),
    "Biomedical Imaging and Analytics": ("Biomedical Imaging", "Bioinformatics & Healthcare"),
    "Sensor-based Health Monitoring": ("Sensor-based Health Monitoring", "Bioinformatics & Healthcare"),
    "Bio-related Signal Processing": ("Bio-signal Processing", "Bioinformatics & Healthcare"),
    "Cognitive Neuroscience": ("Cognitive Neuroscience", "Bioinformatics & Healthcare"),
    "Memory Enhancement": ("Memory Enhancement", "Bioinformatics & Healthcare"),
    "Sleep Quality Research": ("Sleep Quality Research", "Bioinformatics & Healthcare"),
    "Brain-Computer Interfaces (BCI)": ("Brain-Computer Interfaces", "Bioinformatics & Healthcare"),
    "AI for Healthcare and Social Good": ("AI for Healthcare", "Bioinformatics & Healthcare"),

    # HCI & UX
    "HCI": ("Human-Computer Interaction", "HCI & UX"),
    "HCI & Accessibility": ("HCI & Accessibility", "HCI & UX"),
    "HCI (Human Computer Interaction)": ("Human-Computer Interaction", "HCI & UX"),
    "HCI, Cybersecurity": ("HCI & Cybersecurity", "HCI & UX"),
    "Human Computer Interaction (HCI)": ("Human-Computer Interaction", "HCI & UX"),
    "Human-Computer Interaction (HCI)": ("Human-Computer Interaction", "HCI & UX"),
    "Human Factors in Computing": ("Human Factors in Computing", "HCI & UX"),
    "Human-Centered AI": ("Human-Centered AI", "HCI & UX"),
    "Human-Centered Computing": ("Human-Centered Computing", "HCI & UX"),
    "User-Centered Design": ("User-Centered Design", "HCI & UX"),
    "Software Engineering & HCI": ("Software Engineering & HCI", "HCI & UX"),
    "EEG Signals ProcessingHuman Computer Interaction": ("EEG & HCI", "HCI & UX"),

    # Systems & Networking
    "Cloud Engineering": ("Cloud Engineering", "Systems & Networking"),
    "Distributed Systems": ("Distributed Systems", "Systems & Networking"),
    "Distributed Systems & Cloud Computing": ("Distributed Systems & Cloud", "Systems & Networking"),
    "Computer Networks": ("Computer Networks", "Systems & Networking"),
    "Networking": ("Networking", "Systems & Networking"),
    "Networking & IoT": ("Networking & IoT", "Systems & Networking"),
    "NetworkingTechnical Education": ("Networking", "Systems & Networking"),
    "Internet of Things": ("Internet of Things (IoT)", "Systems & Networking"),
    "Mobile/Edge Computing": ("Mobile & Edge Computing", "Systems & Networking"),
    "Parallel Computing": ("Parallel Computing", "Systems & Networking"),
    "Embedded Systems": ("Embedded Systems", "Systems & Networking"),
    "Task Scheduling in Cloud Computing": ("Task Scheduling in Cloud", "Systems & Networking"),
    "Cache Management Policies": ("Cache Management", "Systems & Networking"),
    "Log-structured Merge-tree": ("Log-structured Merge-tree", "Systems & Networking"),
    "Zoned Namespace SSD": ("Zoned Namespace SSD", "Systems & Networking"),
    "Simulation and Modeling": ("Simulation & Modeling", "Systems & Networking"),

    # Software Engineering
    "Software Engineering": ("Software Engineering", "Software Engineering"),
    "Software engineering": ("Software Engineering", "Software Engineering"),
    "Software Development": ("Software Development", "Software Engineering"),
    "Software Testing and Verification": ("Software Testing & Verification", "Software Engineering"),
    "Empirical Software Engineering": ("Empirical Software Engineering", "Software Engineering"),
    "AI for Software Engineering (AI4SE)": ("AI for Software Engineering", "Software Engineering"),
    "Fault Detection and Fault Tolerance": ("Fault Detection & Tolerance", "Software Engineering"),

    # Theory & Algorithms
    "Algorithms": ("Algorithms", "Theory & Algorithms"),
    "Theory and Algorithms": ("Theory & Algorithms", "Theory & Algorithms"),
    "General Algorithms": ("General Algorithms", "Theory & Algorithms"),
    "Ranking Algorithms": ("Ranking Algorithms", "Theory & Algorithms"),
    "Graph Theory": ("Graph Theory", "Theory & Algorithms"),
    "Computational Geometry": ("Computational Geometry", "Theory & Algorithms"),
    "Systems of Linear Equations": ("Systems of Linear Equations", "Theory & Algorithms"),
    "Linear Programming": ("Linear Programming", "Theory & Algorithms"),
    "Multi-Agent Path Finding (MAPF)": ("Multi-Agent Path Finding", "Theory & Algorithms"),

    # Hardware & Electronics
    "VLSI": ("VLSI Design", "Hardware & Electronics"),
    "Analog Circuit Design": ("Analog Circuit Design", "Hardware & Electronics"),
    "Nanoelectronics": ("Nanoelectronics", "Hardware & Electronics"),
    "DFT Simulation": ("DFT Simulation", "Hardware & Electronics"),
    "2D Materials": ("2D Materials", "Hardware & Electronics"),
    "2d Materials, IOT, Device Physics": ("2D Materials & Device Physics", "Hardware & Electronics"),
    "Quantum Devices": ("Quantum Devices", "Hardware & Electronics"),
    "Nanophotonics": ("Nanophotonics", "Hardware & Electronics"),
    "Plasmonics": ("Plasmonics", "Hardware & Electronics"),
    "Flat Optics": ("Flat Optics", "Hardware & Electronics"),
    "Metamaterials and Non-linear Optics": ("Metamaterials & Non-linear Optics", "Hardware & Electronics"),
    "Integrated Photonics": ("Integrated Photonics", "Hardware & Electronics"),
    "Opto-electronics": ("Opto-electronics", "Hardware & Electronics"),
    "Wireless Communications": ("Wireless Communications", "Hardware & Electronics"),
    "MIMO Hybrid Beamforming Systems": ("MIMO Hybrid Beamforming", "Hardware & Electronics"),
    "Design of Net Zero Energy Buildings": ("Net Zero Energy Buildings", "Hardware & Electronics"),

    # Robotics
    "Robotics": ("Robotics", "Robotics & Automation"),

    # Quantum Computing
    "Quantum Neural Networks (QNN)": ("Quantum Neural Networks", "Quantum Computing"),
    "Quantum Communication": ("Quantum Communication", "Quantum Computing"),

    # Explainability & Ethics
    "Explainable AI": ("Explainable AI (XAI)", "Explainability & Ethics"),
    "Explainable AI (XAI)": ("Explainable AI (XAI)", "Explainability & Ethics"),
    "Explainability in AI": ("Explainable AI (XAI)", "Explainability & Ethics"),
    "Trustworthy AI/ XAI": ("Trustworthy AI & XAI", "Explainability & Ethics"),
    "Model Optimization & Pruning": ("Model Optimization & Pruning", "Explainability & Ethics"),
}

rows = []
skipped = []
for area in sorted(all_areas):
    if area in MAPPING:
        canonical, category = MAPPING[area]
        rows.append([area, canonical, category])
    else:
        skipped.append(area)

out = Path(__file__).parent / "research_areas_normalization.csv"
with open(out, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["original_area", "canonical_name", "category"])
    w.writerows(rows)

print(f"Mapped:   {len(rows)}")
print(f"Missing:  {len(skipped)}")
for s in skipped:
    print("  MISSING:", repr(s))
print(f"\nSaved: {out}")
