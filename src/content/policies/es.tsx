// The policies in Spanish: a translation of en.tsx, which is the version that
// applies. Students and mentors are "tú"; the parent consent page speaks to
// parents as "usted". Names of buttons and pages on the site, which is in
// English, are given in English where people need to find them.

import Link from 'next/link';
import { policyHref } from '@/lib/policy-languages';
import type { PolicySet } from './types';

const to = (path: string) => policyHref(path, 'es');

export const es: PolicySet = {
  chrome: {
    names: {
      conduct: 'Código de conducta',
      terms: 'Condiciones de uso',
      privacy: 'Política de privacidad',
      consent: 'Consentimiento de padres y tutores',
    },
    policiesLabel: 'Políticas',
    languageLabel: 'Idioma',
    lastUpdated: (date) => `Última actualización: ${date}`,
    onThisPage: 'En esta página',
    translationNote: 'Esta es una traducción. Si difiere de la versión en inglés, se aplica la versión en inglés.',
    readInEnglish: 'Leer en inglés',
  },

  conduct: {
    title: 'Código de conducta',
    description: 'Cómo se tratan estudiantes, familias, mentores y voluntarios en Note by Note.',
    summary: (
      <p>
        Note by Note funciona porque estudiantes, familias y voluntarios confían unos en otros. Este código se aplica a
        todas las personas con una cuenta: estudiantes, padres, madres y tutores, mentores y voluntarios de todos los
        equipos.
      </p>
    ),
    sections: [
      {
        id: 'respect',
        title: 'Trata a todos con respeto',
        body: (
          <>
            <p>
              Trata a todos con amabilidad y paciencia. No se permiten el acoso, el bullying ni la discriminación, ya sea
              por raza, origen étnico, religión, género, identidad de género, orientación sexual, discapacidad, edad,
              origen o nivel musical.
            </p>
            <p>
              Los comentarios deben tratar sobre la música, no sobre la persona. Todos los estilos de música y todos los
              puntos de partida son bienvenidos.
            </p>
          </>
        ),
      },
      {
        id: 'reliable',
        title: 'Cumple con tus clases',
        body: (
          <>
            <p>
              Asiste puntualmente a las clases que acordaste. Si no puedes ir a una, avísale a la otra persona lo antes
              posible en la <Link href="/dashboard/lessons">página de clases</Link> (Lessons).
            </p>
            <p>
              Si necesitas dejar las clases, díselo a tu mentor o estudiante y avisa al equipo a través de la{' '}
              <Link href="/contact">página de contacto</Link>, para que nadie se quede esperando.
            </p>
          </>
        ),
      },
      {
        id: 'safe-lessons',
        title: 'Clases seguras',
        body: (
          <>
            <p>
              Muchos de nuestros estudiantes son menores de 18 años, y muchos de nuestros mentores también son
              estudiantes. Por la seguridad de todos:
            </p>
            <ul>
              <li>Las clases son en línea, por el enlace de videollamada de la página de clases. No se reúnan en persona.</li>
              <li>
                Comunícate por los mensajes de Note by Note. No pidas ni compartas números de teléfono personales, redes
                sociales ni direcciones.
              </li>
              <li>Mantén las conversaciones sobre la música y las clases.</li>
              <li>Conéctate a las videollamadas desde un lugar adecuado y con la ropa que llevarías a la escuela.</li>
              <li>
                Para estudiantes menores de 13 años, un padre, madre o tutor debe estar cerca durante las clases. Los
                estudiantes menores de 18 años necesitan el <Link href={to('/parent-consent')}>consentimiento</Link> de
                un padre, madre o tutor antes de empezar las clases.
              </li>
              <li>
                No grabes una clase ni tomes fotos o capturas de pantalla de la otra persona, a menos que ambos estén de
                acuerdo. Si el estudiante es menor de 18 años, su padre, madre o tutor también debe estar de acuerdo.
              </li>
              <li>Nada de regalos ni dinero. Las clases son gratuitas y los mentores nunca piden pago.</li>
            </ul>
          </>
        ),
      },
      {
        id: 'mentors',
        title: 'Para mentores',
        body: (
          <ul>
            <li>Eres un ejemplo a seguir. Ten paciencia, anima a tu estudiante y di con sinceridad lo que puedes enseñar.</li>
            <li>Mantén una relación amable pero profesional con tu estudiante y su familia.</li>
            <li>Mantén en privado lo que sabes de tu estudiante. No compartas sus datos fuera de Note by Note.</li>
            <li>
              Si un estudiante dice algo que te hace preocuparte por su seguridad, avisa al equipo de inmediato a través
              de la <Link href="/contact">página de contacto</Link>. No intentes resolverlo por tu cuenta.
            </li>
          </ul>
        ),
      },
      {
        id: 'volunteers',
        title: 'Para voluntarios del equipo',
        body: (
          <ul>
            <li>Usa lo que ves en el área del personal (Staff area) solo para tu función y solo cuando lo necesites.</li>
            <li>No copies, descargues ni compartas la información personal de nadie fuera de Note by Note.</li>
            <li>
              Los administradores leen los mensajes entre mentores y estudiantes solo para proteger a las personas, por
              ejemplo cuando se reporta uno.
            </li>
            <li>No tomes decisiones sobre tu propia solicitud ni tus propias clases. Pídeselo a otra persona del equipo.</li>
          </ul>
        ),
      },
      {
        id: 'sharing',
        title: 'Compartir archivos y música',
        body: (
          <>
            <p>
              Comparte solo lo que tienes derecho a compartir. Respeta los derechos de autor: no pases partituras de pago
              ni grabaciones que no te corresponda compartir.
            </p>
            <p>
              Las grabaciones, composiciones y otros trabajos de un estudiante le pertenecen. No los compartas con nadie
              sin su permiso, y el de su padre, madre o tutor si es menor de 18 años.
            </p>
          </>
        ),
      },
      {
        id: 'messages',
        title: 'Mensajes y controles de seguridad',
        body: (
          <p>
            Los mensajes entre mentores y estudiantes se quedan en Note by Note para que podamos proteger a todos. Los
            administradores de Note by Note pueden leerlos, por ejemplo cuando se reporta un mensaje. Los demás
            voluntarios no pueden. Encontrarás más información en nuestra{' '}
            <Link href={to('/privacy')}>Política de privacidad</Link>.
          </p>
        ),
      },
      {
        id: 'report',
        title: 'Reportar un problema',
        body: (
          <>
            <p>
              Si algo no te parece bien, cuéntanoslo. Usa <strong>Report</strong> (Reportar) en un mensaje, una clase o
              la página de un mentor, o <Link href="/dashboard/report">reporta un problema</Link> desde tu panel. También
              puedes escribirnos a través de la <Link href="/contact">página de contacto</Link>. La persona reportada no
              sabe quién la reportó.
            </p>
            <p>Si alguien está en peligro, llama primero a los servicios de emergencia de tu zona.</p>
          </>
        ),
      },
      {
        id: 'breaking',
        title: 'Si no se cumple este código',
        body: (
          <>
            <p>
              Según lo que haya pasado, podemos dar un aviso, pausar las clases, terminar la pareja de mentor y
              estudiante, retirar a alguien del programa o cerrar su cuenta.
            </p>
            <p>
              Si nos preocupa la seguridad de un menor, podemos informar a su padre, madre o tutor y, cuando la ley lo
              exija, a las autoridades.
            </p>
          </>
        ),
      },
    ],
  },

  terms: {
    title: 'Condiciones de uso',
    description: 'Las condiciones para usar el sitio web de Note by Note y participar en sus clases de música gratuitas.',
    summary: (
      <p>
        En resumen: las clases son gratuitas, los mentores son voluntarios, cuidamos la seguridad de todos y respetamos
        lo que comparten los demás. Los detalles están abajo.
      </p>
    ),
    sections: [
      {
        id: 'about',
        title: 'Sobre estas condiciones',
        body: (
          <>
            <p>
              Estas condiciones se aplican a todas las personas que usan el sitio web de Note by Note. Al crear una
              cuenta o usar el sitio, aceptas estas condiciones, nuestro{' '}
              <Link href={to('/code-of-conduct')}>Código de conducta</Link> y la forma en que tratamos la información,
              descrita en nuestra <Link href={to('/privacy')}>Política de privacidad</Link>.
            </p>
            <p>Si eres menor de 18 años, lee estas condiciones con tu padre, madre o tutor.</p>
          </>
        ),
      },
      {
        id: 'what-we-are',
        title: 'Qué es Note by Note',
        body: (
          <>
            <p>
              Note by Note es un programa de voluntariado dirigido por estudiantes que ofrece clases de música gratuitas
              en línea. Los mentores son voluntarios, a menudo estudiantes también. Tocan bien su instrumento y lo
              explican con paciencia, pero no son profesores profesionales.
            </p>
            <p>
              Las clases son gratuitas. Hacemos todo lo posible por asignar un mentor a cada estudiante, pero no podemos
              prometer una asignación, un mentor en particular, un número fijo de clases ni ningún resultado concreto.
            </p>
          </>
        ),
      },
      {
        id: 'accounts',
        title: 'Tu cuenta',
        body: (
          <ul>
            <li>Da información correcta y mantenla al día.</li>
            <li>No compartas tu contraseña. Eres responsable de lo que pase en tu cuenta.</li>
            <li>Una persona por cuenta. Un padre, madre o tutor puede crear y administrar una cuenta para su hijo o hija.</li>
            <li>
              Si crees que otra persona ha usado tu cuenta, avísanos a través de la{' '}
              <Link href="/contact">página de contacto</Link>.
            </li>
          </ul>
        ),
      },
      {
        id: 'under-18',
        title: 'Estudiantes menores de 18 años',
        body: (
          <p>
            Un padre, madre o tutor debe dar su <Link href={to('/parent-consent')}>consentimiento</Link> antes de que un
            estudiante menor de 18 años empiece las clases. Puede retirarlo en cualquier momento contactándonos, y las
            clases se detendrán.
          </p>
        ),
      },
      {
        id: 'lessons',
        title: 'Clases',
        body: (
          <>
            <p>
              Los estudiantes y mentores organizan las clases en el sitio. Las clases se dan por un servicio de
              videollamadas, como Zoom o Google Meet, con el enlace de la página de clases. Las condiciones y la política
              de privacidad de ese servicio se aplican a la llamada.
            </p>
            <p>Cualquiera de los dos puede dejar las clases en cualquier momento. Por favor, avisa a la otra persona y al equipo.</p>
          </>
        ),
      },
      {
        id: 'content',
        title: 'Lo que compartes',
        body: (
          <>
            <p>
              Lo que publicas o subes sigue siendo tuyo: mensajes, archivos, grabaciones y tu página de mentor. Le das
              permiso a Note by Note para guardarlo y mostrarlo a las personas a las que va dirigido, para que el sitio
              funcione.
            </p>
            <p>
              La página de un mentor, incluida una foto aprobada, es pública en Find a Mentor (Buscar un mentor) cuando
              nuestro equipo la publica. Los miembros del equipo que aparecen en la página About (Quiénes somos) también
              se muestran allí.
            </p>
            <p>
              No compartas nada ilegal o dañino, ni nada que no tengas derecho a compartir. Podemos eliminar contenido
              que no cumpla estas condiciones o el Código de conducta.
            </p>
          </>
        ),
      },
      {
        id: 'use',
        title: 'Uso justo del sitio',
        body: (
          <ul>
            <li>No intentes entrar en las cuentas de otras personas ni en partes del sitio a las que no tienes acceso.</li>
            <li>No interfieras con el sitio, no lo sobrecargues ni copies información de él de forma masiva.</li>
            <li>No lo uses para enviar spam ni publicidad.</li>
          </ul>
        ),
      },
      {
        id: 'volunteers',
        title: 'Voluntarios',
        body: (
          <>
            <p>
              Los voluntarios de nuestros equipos tienen acceso a lo que necesita su función. Ese acceso es solo para el
              trabajo de Note by Note, y lo que ves allí es confidencial.
            </p>
            <p>
              Las horas de voluntariado se registran en el sitio y las aprueba el equipo. No podemos prometer que una
              escuela u organización las acepte.
            </p>
          </>
        ),
      },
      {
        id: 'ending',
        title: 'Cerrar una cuenta',
        body: (
          <p>
            Puedes pedirnos que cerremos tu cuenta en cualquier momento a través de la{' '}
            <Link href="/contact">página de contacto</Link>. Podemos pausar o cerrar una cuenta que no cumpla estas
            condiciones o el Código de conducta, o para proteger a alguien.
          </p>
        ),
      },
      {
        id: 'no-guarantees',
        title: 'Sin garantías',
        body: (
          <>
            <p>
              El sitio lo administran voluntarios y se ofrece tal como está. A veces puede ir lento o no estar
              disponible, por ejemplo mientras nuestro servidor se pone en marcha después de un rato sin uso.
            </p>
            <p>
              En la medida en que la ley lo permita, Note by Note y sus voluntarios no son responsables de pérdidas
              indirectas por el uso del sitio o de las clases. Nada en estas condiciones elimina los derechos que te da
              la ley.
            </p>
          </>
        ),
      },
      {
        id: 'changes',
        title: 'Cambios en estas condiciones',
        body: (
          <p>
            Podemos actualizar estas condiciones. La fecha de arriba indica cuándo cambiaron por última vez. Si un cambio
            afecta a cómo usas el sitio, te pediremos que aceptes la nueva versión la próxima vez que inicies sesión.
          </p>
        ),
      },
      {
        id: 'contact',
        title: 'Contacto',
        body: (
          <p>
            ¿Tienes preguntas sobre estas condiciones? Escríbenos a través de la{' '}
            <Link href="/contact">página de contacto</Link>.
          </p>
        ),
      },
    ],
  },

  privacy: {
    title: 'Política de privacidad',
    description: 'Qué información guarda Note by Note, por qué y quién puede verla.',
    summary: (
      <p>
        Guardamos lo que necesitamos para dar clases gratuitas y proteger a los estudiantes. No lo vendemos ni lo usamos
        para publicidad.
      </p>
    ),
    sections: [
      {
        id: 'collect',
        title: 'Qué guardamos',
        body: (
          <>
            <p>Solo guardamos lo que necesitamos para dar clases gratuitas y proteger a las personas:</p>
            <ul>
              <li>
                <strong>Tu cuenta:</strong> tu nombre, tu correo electrónico y tu función. Tu contraseña se guarda
                codificada, así que nadie en Note by Note puede leerla.
              </li>
              <li>
                <strong>Solicitudes:</strong> tus respuestas, como tu escuela, grupo de edad, instrumento, nivel, los días
                y horas en que estás libre, idiomas y metas. Para un estudiante menor de 18 años, el nombre y el correo de
                un padre, madre o tutor.
              </li>
              <li>
                <strong>Páginas de mentor:</strong> lo que los mentores escriben sobre sí mismos, sus instrumentos, sus
                horarios libres de cada semana y una foto si añaden una.
              </li>
              <li>
                <strong>Clases:</strong> solicitudes, horarios de clase acordados, avisos de “no puedo ir”, notas de
                clase, listas de práctica y enlaces de videollamada.
              </li>
              <li>
                <strong>Mensajes y archivos</strong> compartidos entre un mentor y su estudiante.
              </li>
              <li>
                <strong>Horas de voluntariado</strong> que registran los mentores y voluntarios.
              </li>
              <li>
                <strong>Acuerdos:</strong> cuándo aceptaste el Código de conducta y las Condiciones de uso, y el nombre que
                escribiste. Para un estudiante menor de 18 años, el consentimiento de su padre, madre o tutor: su nombre,
                correo, relación con el estudiante y la fecha.
              </li>
              <li>
                <strong>Mensajes enviados con nuestro formulario de contacto.</strong>
              </li>
              <li>
                <strong>Visitas:</strong> qué páginas se ven, sin las partes de la dirección web que podrían
                identificarte.
              </li>
            </ul>
          </>
        ),
      },
      {
        id: 'use',
        title: 'Cómo la usamos',
        body: (
          <>
            <p>
              Para asignar mentores a los estudiantes, organizar y dar las clases, proteger a todos, contactarte sobre el
              programa y saber qué páginas son útiles.
            </p>
            <p>No vendemos tu información ni la usamos para publicidad.</p>
          </>
        ),
      },
      {
        id: 'who-sees',
        title: 'Quién puede verla',
        body: (
          <ul>
            <li>
              <strong>Tu mentor o estudiante.</strong> Antes de aceptar a un estudiante, el mentor ve su nombre de pila,
              grupo de edad, nivel, instrumento y horarios preferidos. Cuando lo acepta, también ve el nombre y el correo
              de la cuenta que hizo la solicitud.
            </li>
            <li>
              <strong>El público.</strong> Las páginas de mentor publicadas, incluidas las fotos aprobadas, se muestran en
              Find a Mentor. Los miembros del equipo de la página About se muestran allí. Nada más es público.
            </li>
            <li>
              <strong>El equipo de Note by Note.</strong> Los voluntarios solo ven lo que necesita su función. Los
              administradores pueden leer los mensajes entre mentores y estudiantes para proteger a las personas, por
              ejemplo cuando se reporta uno. Algunos voluntarios solo ven totales, nunca nombres.
            </li>
            <li>
              <strong>Servicios que hacen funcionar el sitio</strong> (en la lista de abajo), solo para hacer ese trabajo.
            </li>
            <li>
              <strong>Otros, solo si es obligatorio:</strong> si la ley lo exige o para proteger a alguien de un daño.
            </li>
          </ul>
        ),
      },
      {
        id: 'services',
        title: 'Servicios que usamos',
        body: (
          <ul>
            <li>
              <strong>Vercel</strong> aloja el sitio web y cuenta las visitas a las páginas.
            </li>
            <li>
              <strong>Render</strong> hace funcionar nuestro servidor.
            </li>
            <li>
              <strong>MongoDB Atlas</strong> guarda nuestra base de datos.
            </li>
            <li>
              <strong>Google Analytics</strong> cuenta las visitas. Desactivamos Google Signals y la personalización de
              anuncios, y quitamos de las direcciones que ve todo lo que podría identificarte.
            </li>
            <li>
              <strong>Formspree</strong> entrega los mensajes de nuestro formulario de contacto.
            </li>
            <li>
              <strong>Un servicio de envío de correos</strong> envía los correos del sitio, como avisos de clases y
              solicitudes de consentimiento.
            </li>
            <li>
              <strong>Los servicios de videollamada</strong> que eliges para las clases, como Zoom o Google Meet, tienen
              sus propias políticas de privacidad.
            </li>
          </ul>
        ),
      },
      {
        id: 'cookies',
        title: 'Cookies y almacenamiento del navegador',
        body: (
          <>
            <p>
              Para mantener tu sesión iniciada, el sitio guarda una clave de inicio de sesión en el almacenamiento de tu
              navegador. También recuerda pequeñas preferencias, como la última pestaña del panel que usaste. Al cerrar
              sesión se borra la clave.
            </p>
            <p>
              Google Analytics usa cookies para contar las visitas. El conteo de visitas de Vercel no usa cookies. Puedes
              bloquear o borrar las cookies en la configuración de tu navegador; el sitio sigue funcionando.
            </p>
          </>
        ),
      },
      {
        id: 'security',
        title: 'Seguridad',
        body: (
          <p>
            Las conexiones con el sitio están cifradas. Las contraseñas se guardan codificadas. Se quitan los datos de
            ubicación y de cámara de las fotos que se suben. El acceso de los voluntarios se limita a su función, y el
            personal solo puede entrar en cuentas de prueba, nunca en la cuenta de una persona real.
          </p>
        ),
      },
      {
        id: 'how-long',
        title: 'Cuánto tiempo la guardamos',
        body: (
          <p>
            Guardamos tu información mientras tu cuenta esté abierta. Cuando nos pidas cerrarla, eliminaremos tu
            información o la haremos anónima, salvo lo que debamos conservar por motivos de seguridad o porque la ley lo
            exija.
          </p>
        ),
      },
      {
        id: 'choices',
        title: 'Tus opciones',
        body: (
          <ul>
            <li>
              Pide ver, corregir o eliminar tu información a través de la <Link href="/contact">página de contacto</Link>.
            </li>
            <li>
              Elige qué correos recibes en la <Link href="/dashboard/settings">configuración de tu cuenta</Link>.
            </li>
            <li>Un padre, madre o tutor puede retirar el consentimiento para su hijo o hija en cualquier momento contactándonos.</li>
          </ul>
        ),
      },
      {
        id: 'children',
        title: 'Niños y adolescentes',
        body: (
          <p>
            Muchos de nuestros estudiantes son menores de 18 años. Un padre, madre o tutor da su{' '}
            <Link href={to('/parent-consent')}>consentimiento</Link> antes de que empiecen las clases y puede pedir ver o
            eliminar la información de su hijo o hija. Si tienes menos de 13 años, pide a tu padre, madre o tutor que cree
            tu cuenta contigo.
          </p>
        ),
      },
      {
        id: 'changes',
        title: 'Cambios en esta política',
        body: <p>Si cambiamos la forma en que tratamos la información, actualizaremos esta página y la fecha de arriba.</p>,
      },
      {
        id: 'contact',
        title: 'Contacto',
        body: (
          <p>
            ¿Tienes preguntas sobre privacidad? Escríbenos a través de la <Link href="/contact">página de contacto</Link>.
          </p>
        ),
      },
    ],
  },

  consent: {
    title: 'Consentimiento de padres y tutores',
    description: 'Lo que aceptan los padres y tutores cuando un estudiante menor de 18 años toma clases con Note by Note.',
    summary: (
      <p>
        Los estudiantes menores de 18 años necesitan el consentimiento de un padre, madre o tutor antes de empezar las
        clases. Aquí se explica en qué consisten las clases y qué está aceptando.
      </p>
    ),
    sections: [
      {
        id: 'lessons',
        title: 'En qué consisten las clases',
        body: (
          <ul>
            <li>
              Clases de música gratuitas e individuales con un mentor voluntario, que a menudo es estudiante de
              secundaria o de universidad.
            </li>
            <li>
              Las clases se dan por videollamada, como Zoom o Google Meet, en un horario semanal que su hijo o hija y su
              mentor acuerdan.
            </li>
            <li>
              Su hijo o hija y su mentor pueden enviarse mensajes, compartir archivos y llevar notas de clase en el sitio
              web de Note by Note.
            </li>
            <li>No tiene ningún costo, y los mentores nunca piden dinero ni regalos.</li>
          </ul>
        ),
      },
      {
        id: 'safety',
        title: 'Cómo protegemos a los estudiantes',
        body: (
          <ul>
            <li>
              Todos aceptan nuestro <Link href={to('/code-of-conduct')}>Código de conducta</Link>: las clases son en
              línea, el contacto se mantiene en el sitio y las conversaciones tratan sobre música.
            </li>
            <li>
              Los mentores no piden números de teléfono, redes sociales ni direcciones, y no se reúnen en persona con los
              estudiantes.
            </li>
            <li>
              Los administradores de Note by Note pueden leer los mensajes entre mentores y estudiantes, por ejemplo
              cuando se reporta un mensaje.
            </li>
            <li>
              Las clases no se graban a menos que ambas partes estén de acuerdo y, en el caso de su hijo o hija, usted
              también.
            </li>
            <li>
              Los estudiantes y sus padres pueden reportar un problema en cualquier momento, y la persona reportada no
              sabe quién la reportó.
            </li>
          </ul>
        ),
      },
      {
        id: 'information',
        title: 'Lo que ve el mentor de su hijo o hija',
        body: (
          <p>
            Antes de aceptar, el mentor ve el nombre de pila de su hijo o hija, su grupo de edad, nivel, instrumento y
            horarios preferidos. Cuando acepta, también ve el nombre y el correo de la cuenta que hizo la solicitud.
            Nuestra <Link href={to('/privacy')}>Política de privacidad</Link> explica el resto.
          </p>
        ),
      },
      {
        id: 'agreeing',
        title: 'Lo que usted acepta',
        body: (
          <ul>
            <li>
              Usted es el padre, la madre o el tutor legal del estudiante, o la persona responsable de su cuidado.
            </li>
            <li>Su hijo o hija puede participar en clases gratuitas en línea y usar el sitio como se describe arriba.</li>
            <li>Ha leído el Código de conducta y la Política de privacidad.</li>
            <li>Si su hijo o hija tiene menos de 13 años, usted u otro adulto estará cerca durante las clases.</li>
          </ul>
        ),
      },
      {
        id: 'withdraw',
        title: 'Si cambia de opinión',
        body: (
          <p>
            Puede retirar su consentimiento en cualquier momento a través de nuestra{' '}
            <Link href="/contact">página de contacto</Link>. Las clases se detendrán y puede pedirnos que eliminemos la
            información de su hijo o hija.
          </p>
        ),
      },
    ],
  },
};
