"""
Fix all research areas that are sentences, merged strings, or comma-lists
so each entry is a single clean area name (displayed as a TagPill).
Updates frontend/src/data/faculty.json in place.
"""
import json
from pathlib import Path

FACULTY_JSON = Path(__file__).parent.parent / "frontend/src/data/faculty.json"

# name -> replacement list  (replaces the ENTIRE researchAreas array)
FIXES = {
    "Anika Afrin": [
        "Machine Learning",
        "Deep Learning",
        "Artificial Intelligence",
    ],
    "Aniqa Tabassum": [
        "Sensor-based Health Monitoring",
        "Bio-related Signal Processing",
        "Biomedical Imaging and Analytics",
    ],
    "Asif Shahriar": [
        "Computer and Network Security",
        "AI in Security",
        "Security for AI",
        "Natural Language Processing",
        "Machine Learning for NLP",
        "NLP Applications",
        "Large Language Models",
        "Trustworthy LLMs",
        "Retrieval Augmented Generation",
        "Secure & Interpretable LLMs for Communication Protocols (5G and beyond)",
    ],
    "Atanu Roy": [
        "Software Engineering",
        "Machine Learning",
        "Image Processing",
        "Robotics",
    ],
    "Dr. Amitabha Chakrabarty": [
        "Internet of Things",
        "Machine Learning",
        "Deep Learning",
        "Computer Vision",
        "Large Language Models",
        "Networking",
    ],
    "Dr. Chowdhury Mofizur Rahman": [
        "Machine Learning",
        "Data Mining",
        "Artificial Intelligence",
    ],
    "Dr. Farida Chowdhury": [
        "Security Usability",
        "Privacy Usability",
        "HCI (Human Computer Interaction)",
    ],
    "Dr. Farig Yousuf Sadeque": [
        "Applied Natural Language Processing (NLP)",
        "Low-resource Language",
        "NLP for Education",
        "Machine Learning (Applications and Ethics)",
        "Artificial Intelligence and Green AI",
        "Computational Social Science",
        "Information Retrieval",
    ],
    "Dr. Md Sadek Ferdous": [
        "Self-sovereign Identity (SSI)",
        "Blockchain",
        "Trust",
        "Security and Privacy",
    ],
    "Dr. Md. Khalilur Rahman": [
        "Robotics",
        "Vision-based AI",
        "Multi-Modal AI",
        "Vision-based Automation",
    ],
    "Dr. Mohammad Kaykobad": [
        "Graph Theory",
        "Systems of Linear Equations",
        "Computational Geometry",
        "General Algorithms",
        "Ranking Algorithms",
        "Linear Programming",
    ],
    "Dr. Muhammad Iqbal Hossain": [
        "Information Security",
        "Cryptography",
        "Cloud Security",
        "IoT Security",
        "Artificial Intelligence",
        "Machine Learning",
        "Software Engineering",
        "Software Testing and Verification",
    ],
    "Dr. Muhammad Nur Yanhaona": [
        "Theory and Algorithms",
        "Parallel Computing",
        "Graph Theory",
        "Distributed Systems",
        "Security",
        "Information Retrieval",
    ],
    "Fardin Zubair Nafis": [
        "Machine Learning",
        "Deep Learning",
        "Computer Vision",
    ],
    "Farhan Faruk": [
        "Machine Learning",
        "Image Segmentation",
        "Healthcare Applications",
    ],
    "Ittehad Saleh Chowdhury": [
        "Distributed Machine Learning",
        "Federated Learning",
        "Mobile/Edge Computing",
        "Deep Learning",
        "RLHF and Agentic Workflows",
    ],
    "Mahrin Tasfe": [
        "Machine Learning",
        "Deep Learning",
        "Image Processing",
        "Computer Vision",
    ],
    "Majisha Jahan Disha": [
        "Task Scheduling in Cloud Computing",
    ],
    "Md. Ahasanul Alam": [
        "Multi-Agent Path Finding (MAPF)",
        "Natural Language Processing",
    ],
    "Md. Asif Haider": [
        "Software Engineering",
        "Software Security",
        "Large Language Models",
        "Human Factors in Computing",
        "Natural Language Processing",
        "AI for Healthcare and Social Good",
    ],
    "Md. Fatin Ishraq Faruqui": [
        "Machine Learning in Power Systems",
        "Artificial Intelligence",
    ],
    "Md. Moynul Asik Moni": [
        "Machine Learning",
        "Deep Learning",
        "Computer Vision",
        "Natural Language Processing",
    ],
    "Md. Muhtasim Mahmud": [
        "Machine Learning",
        "Deep Learning",
        "Computer Vision",
        "Image Processing",
        "3D Image Processing",
    ],
    "Md. Saiful Islam": [
        "Machine Learning",
        "Deep Learning",
        "Computer Vision",
    ],
    "Md. Zulkar Naim": [
        "Machine Learning",
        "Computer Vision",
        "Large Language Models",
        "Image Generation",
    ],
    "Mohammad Nuwaisir Rahman": [
        "Bioinformatics",
        "Graph Theory",
        "Machine Learning",
        "Computer Vision",
    ],
    "Mohammad Tahsin Alam": [
        "Plasmonics",
        "Opto-electronics",
    ],
    "Moinul Haque": [
        "Large Language Models",
        "Natural Language Processing",
    ],
    "Mr. Annajiat Alim Rasel": [
        "Artificial Intelligence & Data Science",
        "Distributed Systems & Cloud Computing",
        "Software Engineering & HCI",
        "Security & Cybersecurity",
        "Simulation and Modeling",
    ],
    "Mr. Md. Tanzim Reza": [
        "Machine Learning",
        "Deep Learning",
        "Computer Vision",
    ],
    "Mr. Purbayan Das": [
        "Nanophotonics",
        "Plasmonics",
        "Flat Optics",
        "Metamaterials and Non-linear Optics",
        "Integrated Photonics",
    ],
    "Mr. Rubayat Ahmed Khan": [
        "Machine Learning",
        "Machine Vision",
        "Natural Language Processing",
    ],
    "Mr. Zaber Mohammad": [
        "Algorithms",
        "Security Analysis",
        "Natural Language Processing",
        "Software Development",
    ],
    "Ms. Tasnim Ferdous": [
        "Cognitive Neuroscience",
        "Memory Enhancement",
        "Brain-Computer Interfaces (BCI)",
        "Artificial Intelligence",
        "Sleep Quality Research",
    ],
    "Nafis Karim": [
        "Cyber Security",
        "Large Language Models for Security",
        "Machine Learning for Security",
        "Natural Language Processing",
    ],
    "Najeefa Nikhat Choudhury": [
        "Natural Language Processing",
        "Education Technology",
    ],
    "Nazmul Islam": [
        "Cloud Engineering",
        "Artificial Intelligence",
        "Natural Language Processing",
        "Computer Vision",
        "Deep Learning",
        "Reinforcement Learning",
    ],
    "Niaz Ashraf Khan": [
        "Explainable AI (XAI)",
        "Model Optimization & Pruning",
        "Machine Learning for Healthcare",
    ],
    "NIRJHOR DATTA": [
        "Computer Vision",
        "Natural Language Processing",
        "Meta-Heuristics",
        "Bioinformatics",
    ],
    "Partha Bhoumik": [
        "Cyber Security",
        "Blockchain",
        "Threat Intelligence",
        "Image Processing & Computer Vision",
        "Software Engineering",
    ],
    "Pollock Nag": [
        "Classical AI",
        "Machine Learning",
        "Deep Learning",
        "Multimodal AI",
        "Computer Vision",
        "Transfer Learning",
        "Knowledge Distillation",
    ],
    "Prothito Shovon Majumder": [
        "Medical Image Analysis",
        "Video/Scene Understanding",
        "Image Generation",
        "Multimodal Learning",
    ],
    "Rafid Ahnaf": [
        "Machine Learning",
        "Deep Learning",
        "Image Processing",
        "Healthcare Applications",
    ],
    "Redowanul Akbar": [
        "Reinforcement Learning",
        "Trustworthy Large Language Models",
        "Human-Centered Computing",
        "Blockchain and Distributed Systems",
        "Robotics",
        "Embedded Systems",
        "Machine Learning",
        "Cybersecurity",
    ],
    "Rifa Tasfiya": [
        "Natural Language Processing (NLP)",
        "Artificial Intelligence (AI)",
        "Image Processing",
    ],
    "Sadif Ahmed": [
        "Software Engineering",
        "AI for Software Engineering (AI4SE)",
        "LLM for Software Engineering (LLM4SE)",
        "Empirical Software Engineering",
        "Large Language Models",
    ],
    "Sahib Kowsar": [
        "Computer Vision",
        "Image Processing",
        "Object Recognition",
        "Scene Understanding",
        "Deep Learning",
    ],
    "Samiur Rahman": [
        "Artificial Intelligence",
        "Deep Learning",
        "Data Science",
        "Machine Learning",
    ],
    "Shoaib Ahmed Dipu": [
        "Computer Vision",
        "Deep Learning",
        "Natural Language Processing",
        "Bioinformatics and Computational Biology",
    ],
    "Shomen Kundu": [
        "DFT Simulation",
        "2D Materials",
        "Quantum Devices",
        "Nanoelectronics",
        "Analog Circuit Design",
        "VLSI",
        "Deep Learning",
    ],
    "Souvik Ghosh": [
        "Computational Biology",
        "Deep Learning",
        "Computer Vision",
    ],
    "Tanhiat Fatema Afnan": [
        "Data Mining Algorithms",
        "Fault Detection and Fault Tolerance",
        "Security",
    ],
    "Tanvir Muntakim Tonoy": [
        "Wireless Communications",
        "MIMO Hybrid Beamforming Systems",
    ],
    "Towshik Anam Taj": [
        "Artificial Intelligence",
        "Machine Learning",
        "Cyber Security",
        "Cryptography",
    ],
    "Umme Jannat Taposhi": [
        "Human Computer Interaction (HCI)",
        "Artificial Intelligence (AI)",
        "Bioinformatics",
    ],
    "Yasmin Nadia": [
        "Deep Learning",
        "Computer Vision",
        "Multi-modal Learning",
        "Biomedical AI",
        "Explainable AI",
        "Human-Centered AI",
    ],
}

faculty = json.loads(FACULTY_JSON.read_text(encoding="utf-8"))

updated = 0
for f in faculty:
    if f["name"] in FIXES:
        f["researchAreas"] = FIXES[f["name"]]
        updated += 1
        print(f"  fixed: {f['name']} ({len(FIXES[f['name']])} areas)")

FACULTY_JSON.write_text(json.dumps(faculty, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"\nUpdated {updated} faculty in faculty.json")
