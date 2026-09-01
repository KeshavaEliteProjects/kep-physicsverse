"""Full KEP PhysicsVerse curriculum — every concept links to a working simulation."""

TOPIC_META = [
    {"id": "mechanics", "name": "Mechanics", "icon": "gauge", "color": "#2563EB", "emoji": "⚙️", "tagline": "Motion, forces, energy & momentum"},
    {"id": "electricity", "name": "Electricity", "icon": "zap", "color": "#F59E0B", "emoji": "⚡", "tagline": "Charges, circuits & current"},
    {"id": "magnetism", "name": "Magnetism", "icon": "magnet", "color": "#E11D48", "emoji": "🧲", "tagline": "Fields, forces & induction"},
    {"id": "optics", "name": "Optics", "icon": "eye", "color": "#8B5CF6", "emoji": "🔭", "tagline": "Light, lenses & interference"},
    {"id": "thermodynamics", "name": "Thermodynamics", "icon": "thermometer", "color": "#EF4444", "emoji": "🌡️", "tagline": "Heat, entropy & engines"},
    {"id": "waves", "name": "Waves", "icon": "audio-waveform", "color": "#14B8A6", "emoji": "🌊", "tagline": "Oscillations & sound"},
    {"id": "modern", "name": "Modern Physics", "icon": "atom", "color": "#0EA5E9", "emoji": "⚛️", "tagline": "Quantum, atomic & nuclear"},
    {"id": "fluids", "name": "Fluid Mechanics", "icon": "droplets", "color": "#06B6D4", "emoji": "💧", "tagline": "Pressure, flow & buoyancy"},
    {"id": "engineering", "name": "Engineering Physics", "icon": "wrench", "color": "#475569", "emoji": "🛠️", "tagline": "Applied, real-world physics"},
    {"id": "astrophysics", "name": "Astrophysics", "icon": "rocket", "color": "#6366F1", "emoji": "🚀", "tagline": "Planets, stars & the cosmos"},
]

CURRICULUM = {
    "mechanics": [
        {"title": "Units, Dimensions & Vectors", "concepts": [
            ["Physical quantities", "vectors"], ["SI units", "vectors"], ["Dimensions", "vectors"], ["Dimensional analysis", "vectors"],
            ["Scalars and vectors", "vectors"], ["Vector addition", "vectors"], ["Vector resolution", "vectors"]]},
        {"title": "Kinematics", "concepts": [
            ["Position and displacement", "displacement"],
            ["Distance", "distancetracker"],
            ["Speed and velocity", "speedvelocity"],
            ["Acceleration", "acceleration1d"],
            ["Uniform motion", "uniformmotion"],
            ["Uniformly accelerated motion", "kinematics1d"],
            ["Motion graphs", "motiongraphs"],
            ["Relative motion", "relativemotion"],
            ["Free fall", "freefall"],
            ["Projectile motion", "projectile"],
            ["Motion in 2D", "motion2d"]]},

            {"title": "Laws of Motion", "concepts": [
            ["Newton's First Law", "newton1"],
            ["Newton's Second Law", "newton2"],
            ["Newton's Third Law", "newton3"],
            ["Force", "force"],
            ["Mass", "mass"],
            ["Weight", "weight"],
            ["Free-body diagrams", "freebody"],
            ["Normal force", "normalforce"],
            ["Tension", "tension"],
            ["Friction", "friction"],
            ["Inclined plane", "incline"],
            ["Connected bodies", "connectedbodies"],
            ["Pulley systems", "pulley"]]},
        {"title": "Work, Energy & Power", "concepts": [
            ["Work", "energyramp"], ["Work-energy theorem", "energyramp"], ["Kinetic energy", "energyramp"], ["Potential energy", "energyramp"],
            ["Conservation of energy", "energyramp"], ["Power", "energyramp"], ["Conservative forces", "energyramp"],
            ["Spring energy", "spring"], ["Energy diagrams", "energyramp"], ["Energy Skate Ramp", "energyramp"]]},
       {"title": "Momentum & Collisions", "concepts": [
            ["Linear momentum", "linearmomentum"],
            ["Impulse", "impulse"],
            ["Conservation of momentum", "momentumconservation"],
            ["Elastic collision", "elasticcollision"],
            ["Inelastic collision", "inelasticcollision"],
            ["1D collisions", "collision"],
            ["2D collisions", "momentum2d"],
            ["Centre of mass", "com"]]},
        {"title": "Circular Motion", "concepts": [
            ["Angular displacement", "rotation"], ["Angular velocity", "rotation"], ["Angular acceleration", "rotation"], ["Centripetal acceleration", "banked"],
            ["Centripetal force", "banked"], ["Banked roads", "banked"], ["Banked curve", "banked"], ["Conical pendulum", "conical"], ["Vertical circular motion", "verticalloop"]]},
        {"title": "Rotational Motion", "concepts": [
            ["Torque", "rotation"], ["Moment of inertia", "rotation"], ["Radius of gyration", "rotation"], ["Angular momentum", "angmom"],
            ["Rotational kinetic energy", "rotation"], ["Rolling motion", "rolling"], ["Conservation of angular momentum", "angmom"]]},
        {"title": "Gravitation", "concepts": [
            ["Universal law of gravitation", "orbit"], ["Gravitational field", "orbit"], ["Gravitational potential", "orbit"], ["Escape velocity", "orbit"],
            ["Orbital velocity", "orbit"], ["Satellites", "orbit"], ["Kepler's laws", "kepler"], ["Gravity & Orbits", "orbit"]]},
        {"title": "Oscillations", "concepts": [
            ["Periodic motion", "pendulum"], ["SHM", "spring"], ["Simple pendulum", "pendulum"], ["Mass-spring oscillator", "spring"],
            ["Energy in SHM", "spring"], ["Damping", "spring"], ["Resonance", "resonance"]]},
    ],
    "electricity": [
        {"title": "Electrostatics", "concepts": [
            ["Electric charge", "charge"],
            ["Coulomb's law", "charges"],
            ["Electric field", "electricfield"],
            ["Electric field lines", "fieldlines"],
            ["Electric potential", "potential"],
            ["Potential difference", "potentialdiff"],
            ["Electric dipole", "dipole"],
            ["Gauss's law", "gauss"],
            ["Capacitance", "capacitor"],
            ["Capacitors", "capacitorcircuit"],
            ["Energy stored in capacitor", "energycapacitor"]]},

        {"title": "Current Electricity", "concepts": [
            ["Electric current", "electriccurrent"],
            ["Drift velocity", "driftvelocity"],
            ["Resistance", "resistance"],
            ["Resistivity", "resistivity"],
            ["Ohm's law", "ohms"],
            ["Series circuits", "seriescircuit"],
            ["Parallel circuits", "parallelcircuit"],
            ["Kirchhoff's laws", "kirchhoff"],
            ["Wheatstone bridge", "wheatstonebridge"],
            ["Meter bridge", "meterbridge"],
            ["Electrical power", "electricalpower"],
            ["Heating effect", "heatingeffect"]]},
        {"title": "Circuit Components", "concepts": [
            ["Battery", "ohms"], ["Resistor", "ohms"], ["Switch", "ohms"], ["LED", "ohms"], ["Capacitor", "capacitor"],
            ["Diode", "ohms"], ["Multimeter", "ohms"], ["Ammeter", "ohms"], ["Voltmeter", "ohms"]]},
        {"title": "Interactive Circuit Labs", "concepts": [
            ["Ohm's Law", "ohms"], ["Series/parallel circuits", "seriesparallel"], ["Kirchhoff circuit", "seriesparallel"],
            ["Capacitor charging", "rc"], ["RC circuit", "rc"]]},
    ],
    "magnetism": [
        {"title": "Magnetic Field", "concepts": [
            ["Magnetic field", "barmagnet"], ["Magnetic field lines", "barmagnet"], ["Earth's magnetic field", "barmagnet"], ["Magnetic force", "chargeinB"]]},
        {"title": "Moving Charges", "concepts": [
            ["Lorentz force", "chargeinB"], ["Charged particle in magnetic field", "chargeinB"], ["Velocity selector", "chargeinB"], ["Cyclotron", "chargeinB"]]},
        {"title": "Current & Magnetism", "concepts": [
            ["Biot-Savart law", "wireB"], ["Ampere's law", "wireB"], ["Straight conductor", "wireB"], ["Circular loop", "wireB"], ["Solenoid", "wireB"], ["Toroid", "wireB"]]},
        {"title": "Electromagnetic Induction", "concepts": [
            ["Faraday's law", "induction"], ["Lenz's law", "induction"], ["Magnetic flux", "induction"], ["Motional EMF", "induction"], ["Generator", "generator"], ["Transformer", "generator"]]},
        {"title": "Interactive Labs", "concepts": [
            ["Magnetic field mapping", "barmagnet"], ["Charged particle motion", "chargeinB"], ["Solenoid", "wireB"], ["Electromagnetic induction", "induction"], ["Generator", "generator"]]},
    ],
    "optics": [
        {"title": "Ray Optics", "concepts": [
            ["Reflection", "refraction"], ["Refraction", "refraction"], ["Refractive index", "refraction"], ["Snell's law", "refraction"], ["Total internal reflection", "refraction"],
            ["Mirrors", "lens"], ["Mirror equation", "lens"], ["Lenses", "lens"], ["Lens equation", "lens"], ["Magnification", "lens"], ["Prism", "prism"], ["Optical instruments", "lens"]]},
        {"title": "Wave Optics", "concepts": [
            ["Huygens principle", "doubleslit"], ["Interference", "doubleslit"], ["Young's double-slit experiment", "doubleslit"], ["Diffraction", "doubleslit"], ["Polarization", "doubleslit"]]},
        {"title": "Interactive Labs", "concepts": [
            ["Mirror experiment", "lens"], ["Lens experiment", "lens"], ["Prism", "prism"], ["Refraction", "refraction"], ["Total internal reflection", "refraction"], ["Double-slit experiment", "doubleslit"]]},
    ],
    "thermodynamics": [
        {"title": "Thermal Physics", "concepts": [
            ["Temperature", "gasbox"], ["Heat", "heatconduction"], ["Thermal expansion", "heatconduction"], ["Specific heat", "heatconduction"], ["Calorimetry", "heatconduction"], ["Heat transfer", "heatconduction"]]},
        {"title": "Thermodynamics", "concepts": [
            ["System and surroundings", "pvdiagram"], ["Internal energy", "pvdiagram"], ["Work", "pvdiagram"], ["First law", "pvdiagram"], ["Isothermal process", "pvdiagram"],
            ["Adiabatic process", "pvdiagram"], ["Isobaric process", "pvdiagram"], ["Isochoric process", "pvdiagram"], ["Second law", "carnot"], ["Entropy", "carnot"],
            ["Heat engines", "carnot"], ["Refrigerators", "carnot"], ["Carnot engine", "carnot"]]},
        {"title": "Kinetic Theory", "concepts": [
            ["Ideal gas", "gasbox"], ["Pressure", "gasbox"], ["Molecular motion", "gasbox"], ["RMS velocity", "gasbox"], ["Gas laws", "gasbox"]]},
        {"title": "Interactive Labs", "concepts": [
            ["Gas particle simulator", "gasbox"], ["PV diagram", "pvdiagram"], ["Heat transfer", "heatconduction"], ["Carnot engine", "carnot"], ["Gas laws", "gasbox"]]},
    ],
    "waves": [
        {"title": "Oscillations", "concepts": [
            ["Periodic motion", "pendulum"], ["SHM", "spring"], ["Simple harmonic oscillator", "spring"], ["Damping", "spring"], ["Resonance", "resonance"]]},
        {"title": "Mechanical Waves", "concepts": [
            ["Wave motion", "wavestring"], ["Wavelength", "wavestring"], ["Frequency", "wavestring"], ["Amplitude", "wavestring"], ["Wave velocity", "wavestring"],
            ["Transverse waves", "wavestring"], ["Longitudinal waves", "wavestring"], ["Superposition", "beats"], ["Standing waves", "standingwave"]]},
        {"title": "Sound", "concepts": [
            ["Sound waves", "wavestring"], ["Speed of sound", "wavestring"], ["Beats", "beats"], ["Doppler effect", "doppler"], ["Resonance", "standingwave"], ["Pipes", "standingwave"], ["Strings", "standingwave"]]},
        {"title": "Interactive Labs", "concepts": [
            ["Wave on string", "wavestring"], ["Standing waves", "standingwave"], ["Sound waves", "wavestring"], ["Doppler effect", "doppler"], ["Resonance", "resonance"], ["Beats", "beats"]]},
    ],
    "modern": [
        {"title": "Quantum Physics", "concepts": [
            ["Photons", "photoelectric"], ["Planck's hypothesis", "photoelectric"], ["Photoelectric effect", "photoelectric"], ["Matter waves", "matterwave"], ["de Broglie wavelength", "matterwave"], ["Heisenberg uncertainty", "matterwave"]]},
        {"title": "Atomic Physics", "concepts": [
            ["Atomic models", "bohr"], ["Bohr model", "bohr"], ["Energy levels", "bohr"], ["Hydrogen spectrum", "bohr"], ["Spectral lines", "bohr"]]},
        {"title": "Nuclear Physics", "concepts": [
            ["Radioactivity", "decay"], ["Half-life", "decay"], ["Nuclear decay", "decay"], ["Binding energy", "decay"], ["Mass defect", "decay"], ["Fission", "decay"], ["Fusion", "decay"]]},
        {"title": "Relativity", "concepts": [
            ["Special relativity", "relativity"], ["Time dilation", "relativity"], ["Length contraction", "relativity"], ["Mass-energy equivalence", "relativity"]]},
        {"title": "Interactive Labs", "concepts": [
            ["Photoelectric effect", "photoelectric"], ["Hydrogen atom", "bohr"], ["Radioactive decay", "decay"], ["Nuclear fission", "decay"], ["Nuclear fusion", "decay"]]},
    ],
    "fluids": [
        {"title": "Fluid Properties", "concepts": [
            ["Density", "buoyancy"], ["Pressure", "pressuredepth"], ["Pascal's law", "hydraulic"], ["Atmospheric pressure", "pressuredepth"], ["Hydrostatic pressure", "pressuredepth"]]},
        {"title": "Fluid Motion", "concepts": [
            ["Continuity equation", "bernoulli"], ["Flow rate", "bernoulli"], ["Bernoulli's principle", "bernoulli"], ["Venturi effect", "bernoulli"], ["Torricelli's law", "bernoulli"]]},
        {"title": "Fluid Forces", "concepts": [
            ["Buoyancy", "buoyancy"], ["Archimedes' principle", "buoyancy"], ["Floating and sinking", "buoyancy"], ["Viscosity", "bernoulli"], ["Surface tension", "pressuredepth"], ["Capillarity", "pressuredepth"]]},
        {"title": "Interactive Labs", "concepts": [
            ["Hydraulic lift", "hydraulic"], ["Pressure", "pressuredepth"], ["Buoyancy", "buoyancy"], ["Floating/sinking", "buoyancy"], ["Venturi tube", "bernoulli"], ["Water flow", "bernoulli"], ["Bernoulli experiment", "bernoulli"]]},
    ],
    "engineering": [
        {"title": "Mechanical Systems", "concepts": [
            ["Gears", "gears"], ["Pulleys", "pulley"], ["Levers", "lever"], ["Springs", "spring"], ["Cranes", "lever"], ["Mechanical advantage", "lever"]]},
        {"title": "Structures", "concepts": [
            ["Bridges", "bridge"], ["Trusses", "bridge"], ["Load distribution", "bridge"], ["Torque", "rotation"], ["Stability", "bridge"], ["Centre of gravity", "com"]]},
        {"title": "Aerospace Physics", "concepts": [
            ["Projectile & thrust", "projectile"], ["Rocket motion", "rocket"], ["Thrust", "rocket"], ["Drag", "rocket"], ["Orbital mechanics", "orbit"], ["Escape velocity", "orbit"], ["Re-entry", "rocket"]]},
        {"title": "Electrical Engineering", "concepts": [
            ["Motors", "generator"], ["Generators", "generator"], ["Transformers", "generator"], ["Power systems", "ohms"]]},
        {"title": "Renewable Energy", "concepts": [
            ["Solar panels", "renewable"], ["Wind turbines", "renewable"], ["Hydroelectric systems", "renewable"]]},
    ],
    "astrophysics": [
        {"title": "Solar System", "concepts": [
            ["Planets", "planetsystem"], ["Orbits", "kepler"], ["Kepler's laws", "kepler"], ["Gravity", "orbit"], ["Seasons", "planetsystem"], ["Moon phases", "planetsystem"]]},
        {"title": "Stars", "concepts": [
            ["Star formation", "stars"], ["Stellar evolution", "stars"], ["Nuclear fusion", "stars"], ["Main sequence", "stars"], ["Red giants", "stars"], ["Supernova", "stars"]]},
        {"title": "Extreme Objects", "concepts": [
            ["White dwarfs", "stars"], ["Neutron stars", "gravitywell"], ["Black holes", "gravitywell"], ["Event horizon", "gravitywell"], ["Gravitational waves", "gravitywell"]]},
        {"title": "Cosmology", "concepts": [
            ["Expanding universe", "hubble"], ["Big Bang", "hubble"], ["Dark matter", "hubble"], ["Dark energy", "hubble"]]},
        {"title": "Space Physics", "concepts": [
            ["Satellites", "orbit"], ["Orbital mechanics", "orbit"], ["Escape velocity", "orbit"], ["Space missions", "rocket"]]},
    ],
}


def _norm(concept):
    if isinstance(concept, (list, tuple)):
        return {"name": concept[0], "sim": concept[1]}
    return {"name": concept, "sim": None}


def build_topic(topic_id):
    meta = next((t for t in TOPIC_META if t["id"] == topic_id), None)
    if not meta:
        return None
    sections, total, interactive = [], 0, 0
    for sec in CURRICULUM.get(topic_id, []):
        concepts = [_norm(c) for c in sec["concepts"]]
        total += len(concepts)
        interactive += sum(1 for c in concepts if c["sim"])
        sections.append({"title": sec["title"], "concepts": concepts})
    return {**meta, "sections": sections, "concept_count": total, "interactive_count": interactive}


def topic_summaries():
    out = []
    for meta in TOPIC_META:
        total, interactive = 0, 0
        for sec in CURRICULUM.get(meta["id"], []):
            for c in sec["concepts"]:
                total += 1
                if isinstance(c, (list, tuple)) and c[1]:
                    interactive += 1
        out.append({**meta, "concept_count": total, "interactive_count": interactive,
                    "status": "live" if interactive > 0 else "browse"})
    return out