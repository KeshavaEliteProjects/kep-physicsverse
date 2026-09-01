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
            ["Position and displacement", "kinematics1d"], ["Distance", "kinematics1d"], ["Speed and velocity", "kinematics1d"],
            ["Acceleration", "kinematics1d"], ["Uniform motion", "kinematics1d"], ["Uniformly accelerated motion", "kinematics1d"],
            ["Motion graphs", "kinematics1d"], ["Relative motion", "relativemotion"], ["Free fall", "projectile"],
            ["Projectile motion", "projectile"], ["Motion in 2D", "projectile"]]},
        {"title": "Laws of Motion", "concepts": [
            ["Newton's First Law", "newton2"], ["Newton's Second Law", "newton2"], ["Newton's Third Law", "newton2"], ["Force", "newton2"],
            ["Mass", "newton2"], ["Weight", "newton2"], ["Free-body diagrams", "newton2"], ["Normal force", "incline"],
            ["Tension", "pulley"], ["Friction", "newton2"], ["Inclined plane", "incline"], ["Connected bodies", "pulley"], ["Pulley systems", "pulley"]]},
        {"title": "Work, Energy & Power", "concepts": [
            ["Work", "work"], ["Work-energy theorem", "workenergy"], ["Kinetic energy", "kineticenergy"], ["Potential energy", "potentialenergy"],
            ["Conservation of energy", "conservationofenergy"], ["Power", "power"], ["Conservative forces", "conservativeforces"],
            ["Spring energy", "springenergy"], ["Energy diagrams", "conservationofenergy"], ["Energy Skate Ramp", "energyramp"]]},
        {"title": "Momentum & Collisions", "concepts": [
            ["Linear momentum", "collision"], ["Impulse", "collision"], ["Conservation of momentum", "collision"], ["Elastic collision", "collision"],
            ["Inelastic collision", "collision"], ["1D collisions", "collision"], ["2D collisions", "momentum2d"], ["Centre of mass", "com"]]},
        {"title": "Circular Motion", "concepts": [
            ["Angular displacement", "angulardisplacement"], ["Angular velocity", "angularvelocity"], ["Angular acceleration", "angularacceleration"], ["Centripetal acceleration", "centripetalacceleration"],
            ["Centripetal force", "centripetalforce"], ["Banked roads", "bankedroads"], ["Banked curve", "bankedcurve"], ["Conical pendulum", "conical"], ["Vertical circular motion", "verticalloop"]]},
        {"title": "Rotational Motion", "concepts": [
            ["Torque", "torque"], ["Moment of inertia", "momentofinertia"], ["Radius of gyration", "radiusofgyration"], ["Angular momentum", "angularmomentum"],
            ["Rotational kinetic energy", "rotationalkineticenergy"], ["Rolling motion", "rollingmotion"], ["Conservation of angular momentum", "conservationofangularmomentum"]]},
        {"title": "Gravitation", "concepts": [
            ["Universal law of gravitation", "orbit"], ["Gravitational field", "orbit"], ["Gravitational potential", "orbit"], ["Escape velocity", "orbit"],
            ["Orbital velocity", "orbit"], ["Satellites", "orbit"], ["Kepler's laws", "kepler"], ["Gravity & Orbits", "orbit"]]},
        {"title": "Oscillations", "concepts": [
            ["Periodic motion", "pendulum"], ["SHM", "spring"], ["Simple pendulum", "pendulum"], ["Mass-spring oscillator", "spring"],
            ["Energy in SHM", "spring"], ["Damping", "spring"], ["Resonance", "resonance"]]},
    ],
    "electricity": [
        {"title": "Electrostatics", "concepts": [
            ["Electric charge", "charges"], ["Coulomb's law", "charges"], ["Electric field", "charges"], ["Electric field lines", "charges"],
            ["Electric potential", "charges"], ["Potential difference", "charges"], ["Electric dipole", "charges"], ["Gauss's law", "charges"],
            ["Capacitance", "capacitor"], ["Capacitors", "capacitor"], ["Energy stored in capacitor", "capacitor"]]},
        {"title": "Current Electricity", "concepts": [
            ["Electric current", "ohms"], ["Drift velocity", "ohms"], ["Resistance", "ohms"], ["Resistivity", "ohms"], ["Ohm's law", "ohms"],
            ["Series circuits", "seriesparallel"], ["Parallel circuits", "seriesparallel"], ["Kirchhoff's laws", "seriesparallel"],
            ["Wheatstone bridge", "seriesparallel"], ["Meter bridge", "seriesparallel"], ["Electrical power", "ohms"], ["Heating effect", "ohms"]]},
        {"title": "Circuit Components", "concepts": [
            ["Battery", "ohms"], ["Resistor", "ohms"], ["Switch", "ohms"], ["LED", "ohms"], ["Capacitor", "capacitor"],
            ["Diode", "ohms"], ["Multimeter", "ohms"], ["Ammeter", "ohms"], ["Voltmeter", "ohms"]]},
        {"title": "Interactive Circuit Labs", "concepts": [
            ["Ohm's Law", "ohms"], ["Series/parallel circuits", "seriesparallel"], ["Kirchhoff circuit", "kirchhoff"],
            ["Capacitor charging", "capacitorcharging"], ["RC circuit", "rccircuit"]]},
    ],
    "magnetism": [
        {"title": "Magnetic Field", "concepts": [
            ["Magnetic field", "magneticfield"], ["Magnetic field lines", "magneticfieldlines"], ["Earth's magnetic field", "earthsfield"], ["Magnetic force", "magneticforce"]]},
        {"title": "Moving Charges", "concepts": [
            ["Lorentz force", "lorentzforce"], ["Charged particle in magnetic field", "chargeinB"], ["Velocity selector", "velocityselector"], ["Cyclotron", "cyclotron"]]},
        {"title": "Current & Magnetism", "concepts": [
            ["Biot-Savart law", "biotsavart"], ["Ampere's law", "ampereslaw"], ["Straight conductor", "straightconductor"], ["Circular loop", "circularloop"], ["Solenoid", "solenoidlab"], ["Toroid", "toroid"]]},
        {"title": "Electromagnetic Induction", "concepts": [
            ["Faraday's law", "faradayslaw"], ["Lenz's law", "lenzslaw"], ["Magnetic flux", "magneticflux"], ["Motional EMF", "motionalemf"], ["Generator", "acgenerator"], ["Transformer", "transformer"]]},
        {"title": "Interactive Labs", "concepts": [
            ["Magnetic field mapping", "barmagnet"], ["Charged particle motion", "chargeinB"], ["Solenoid", "solenoidlab"],
            ["Electromagnetic induction", "faradayslaw"], ["Generator", "acgenerator"]]},
    ],
    "optics": [
        {"title": "Ray Optics", "concepts": [
            ["Reflection", "reflection"], ["Refraction", "refraction"], ["Refractive index", "refractiveindex"], ["Snell's law", "snellslaw"], ["Total internal reflection", "totalinternalreflection"],
            ["Mirrors", "mirrors"], ["Mirror equation", "mirrorequation"], ["Lenses", "lenses"], ["Lens equation", "lensequation"], ["Magnification", "magnification"], ["Prism", "prism"], ["Optical instruments", "opticalinstruments"]]},
        {"title": "Wave Optics", "concepts": [
            ["Huygens principle", "huygens"], ["Interference", "interference"], ["Young's double-slit experiment", "doubleslit"], ["Diffraction", "diffraction"], ["Polarization", "polarization"]]},
        {"title": "Interactive Labs", "concepts": [
            ["Mirror experiment", "mirrorequation"], ["Lens experiment", "lensequation"], ["Prism", "prism"], ["Refraction", "refraction"], ["Total internal reflection", "totalinternalreflection"], ["Double-slit experiment", "doubleslit"]]},
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
            ["Planets", "planets"], ["Orbits", "orbits"], ["Kepler's laws", "kepler"], ["Gravity", "gravity"], ["Seasons", "seasons"], ["Moon phases", "moonphases"]]},
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
