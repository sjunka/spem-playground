import type { Modelo } from "./modelo";

export const seed = (): Modelo => ({
  version: 1,
  fases: [
    {
      id: "fase-1",
      nombre: "Fase 1: Especificación global de nivel cero",
      objetivo: "Fijar el marco de gobernanza, límites y contratos iniciales.",
      roles: [
        "Gerente de proyecto",
        "Experto del dominio (caficultor)",
        "Ingeniero de seguridad de vuelo",
        "Ingeniero de datos",
      ],
      tareas: [
        {
          id: "t1-1",
          nombre: "Definir Constitución, reglas y contratos globales",
          descripcion:
            "Redactar el Constitution.md estableciendo restricciones y principios no negociables.",
        },
        {
          id: "t1-2",
          nombre: "Capturar y modelar el conocimiento inicial del dominio",
          descripcion:
            "Consolidar junto al Experto del Dominio (caficultor) las reglas agrónomas generales que regirán el sistema.",
        },
        {
          id: "t1-3",
          nombre: "Definir restricciones de seguridad de vuelo y normativas",
          descripcion:
            "Establecer el marco legal y físico preliminar para la operación de drones en la zona.",
        },
      ],
      entrada: [
        "Conocimiento del experto del dominio (caficultor)",
        "Planos del terreno",
        "Normatividad vigente",
      ],
      salida: [
        "Constitution.md",
        "Políticas y límites de operación",
        "Reglas de negocio",
        "Contratos globales",
        "Contratos de integración entre dominios",
      ],
    },
    {
      id: "fase-2",
      nombre: "Fase 2: Descomposición en dominios",
      objetivo:
        "Fragmentar el sistema, preparar los entornos de simulación y traducir esquemas.",
      roles: [
        "Gerente de proyecto",
        "Ingeniero de datos",
        "Ingeniero de plataforma",
        "Ingeniero de software de adaptación",
      ],
      tareas: [
        {
          id: "t2-1",
          nombre: "Identificar subdominios y definir subcontratos internos",
          descripcion:
            "Delimitar responsabilidades entre datos, plataforma, adaptación y vuelo.",
        },
        {
          id: "t2-2",
          nombre: "Seleccionar escenario piloto",
          descripcion:
            "Definir el terreno o lote específico para las pruebas iniciales.",
        },
        {
          id: "t2-3",
          nombre: "Traducir esquemas técnicos y disponer entornos SIL, HIL y gemelos digitales",
          descripcion:
            "Preparar la infraestructura de simulación y los archivos base (spec.md, plan.md, task.md).",
        },
        {
          id: "t2-4",
          nombre: "Diseñar el modelo de arquitectura preliminar",
          descripcion:
            "Estructurar cómo se interconectarán sensores, drones y el servidor de adaptación (bucle MAPE-K).",
        },
        {
          id: "t2-5",
          nombre: "Planificar la estrategia de calibración de sensores y actuadores",
          descripcion:
            "Definir los parámetros base que requerirá el ingeniero de plataforma.",
        },
      ],
      entrada: [
        "Planos del terreno",
        "Constitution.md",
        "Políticas y límites de operación",
        "Reglas de negocio",
        "Contratos globales y de integración entre dominios",
      ],
      salida: [
        "spec.md, plan.md, task.md",
        "Entornos de simulación SIL y HIL configurados",
        "Modelo de arquitectura del sistema",
        "Especificaciones de la lógica de adaptación",
      ],
    },
    {
      id: "fase-3",
      nombre: "Fase 3: Esqueleto funcional mínimo",
      objetivo:
        "Construir el prototipo vertical: unir extremo a extremo una traza mínima del sistema.",
      roles: [
        "Ingeniero de software de adaptación",
        "Ingeniero de datos",
        "QA de software",
        "Ingeniero de plataforma",
        "Gerente de proyecto",
        "Experto del dominio (caficultor)",
      ],
      tareas: [
        {
          id: "t3-1",
          nombre: "Construir prototipo vertical",
          descripcion:
            "Integrar una primera versión conectando datos de sensores, una regla básica del MAPE-K y una acción simulada.",
        },
        {
          id: "t3-2",
          nombre: "Validar el prototipo en entorno simulado (SIL/HIL)",
          descripcion:
            "Probar la traza mínima para verificar que la lógica de control responde antes de tocar hardware real.",
        },
        {
          id: "t3-3",
          nombre: "Establecer el pipeline de CI/CD base",
          descripcion:
            "Automatizar el empaquetado inicial de las especificaciones y el código del prototipo.",
        },
        {
          id: "t3-4",
          nombre: "Validar reglas de negocio y condiciones agronómicas",
        },
      ],
      entrada: [
        "spec.md, plan.md, task.md",
        "Entornos de simulación SIL y HIL configurados",
        "Modelo de arquitectura del sistema",
        "Especificaciones de la lógica de adaptación",
      ],
      salida: [
        "Prototipo vertical funcional",
        "Informes de validación de control",
        "Pipeline de CI/CD base",
      ],
    },
    {
      id: "fase-4",
      nombre: "Fase 4: Ciclo de crecimiento",
      objetivo:
        "Escalar el sistema mediante desarrollo paralelo, integración continua y validación en el cultivo.",
      roles: [
        "Ingeniero de software de adaptación",
        "Ingeniero de datos",
        "QA de software",
        "Ingeniero de plataforma",
        "Gerente de proyecto",
        "Experto del dominio (caficultor)",
      ],
      tareas: [
        {
          id: "t4-1",
          nombre: "Sincronización inter dominio",
          descripcion:
            "Acordar backlogs compartidos entre el gerente de proyecto y los equipos.",
        },
        {
          id: "t4-2",
          nombre: "Construcción en paralelo (contrato primero)",
          descripcion:
            "Desarrollo concurrente de componentes de datos, plataforma, seguridad de vuelo y adaptación.",
        },
        {
          id: "t4-3",
          nombre: "Verificación e integración continua",
          descripcion:
            "Ejecución de pruebas automatizadas mediante CI/CD, SIL/HIL y gemelos digitales.",
        },
        {
          id: "t4-4",
          nombre: "Despliegue en campo y validación fenológica global",
          descripcion:
            "Llevar los releases al terreno real, calibrar dispositivos y evaluar el impacto del riego con el caficultor.",
        },
        {
          id: "t4-5",
          nombre: "Auditoría de cumplimiento de la Constitución",
          descripcion:
            "Revisar que los incrementos no rompan las reglas globales establecidas en la Fase 1.",
        },
        {
          id: "t4-6",
          nombre: "Elaboración y actualización del manual de operación",
          descripcion:
            "Traducir los cambios técnicos de los releases en guías claras para el caficultor.",
        },
      ],
      entrada: [
        "Prototipo vertical funcional",
        "Informes de validación de control",
        "Pipeline de CI/CD base",
        "Monitoreo y operación del dron",
        "Sistema de riego y variables climáticas",
        "Coordinación múltiple de drones",
      ],
      salida: [
        "Código fuente",
        "Archivos spec.md / task.md",
        "Pipeline de CI/CD ejecutado",
        "Entornos SIL/HIL validados",
        "Paquete de calibración de sensores y actuadores",
        "Releases de software",
        "Manual de operación actualizado",
      ],
    },
  ],
});
