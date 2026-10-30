// The words in the two forms on the policy pages: accepting the Code of
// Conduct, and a parent giving consent. These run in the browser, so they're
// plain strings. Keep them in step with en.tsx, es.tsx and fr.tsx.
//
// Error messages from the server stay in English.

import type { PolicyLanguage } from '@/lib/policy-languages';

export interface ConductFormText {
  signedOutTitle: string;
  signedOutBefore: string;
  signIn: string;
  signedOutAfter: string;
  acceptedTitle: string;
  acceptedOn: (date: string) => string;
  thanks: string;
  acceptTitle: string;
  acceptIntro: string;
  /** Text, link, text. */
  conductTick: [string, string, string];
  /** Text, link, text, link, text. */
  termsTick: [string, string, string, string, string];
  nameLabel: string;
  nameHelp: string;
  tickConduct: string;
  tickTerms: string;
  typeName: string;
  notSaved: string;
  saving: string;
  accept: string;
}

export const CONDUCT_FORM: Record<PolicyLanguage, ConductFormText> = {
  en: {
    signedOutTitle: 'Agreeing to this code',
    signedOutBefore: 'Everyone agrees to it when they create an account. If you already have one,',
    signIn: 'sign in',
    signedOutAfter: 'to accept it.',
    acceptedTitle: 'You’ve accepted this code',
    acceptedOn: (date) => `You accepted it on ${date}. `,
    thanks: 'Thank you for helping keep Note by Note a good place to learn.',
    acceptTitle: 'Accept the Code of Conduct',
    acceptIntro: 'Please accept it to keep using your account. We keep a record of the date and the name you type.',
    conductTick: ['I’ve read the ', 'Code of Conduct', ' and agree to follow it.'],
    termsTick: ['I also agree to the ', 'Terms of Use', ' and have read the ', 'Privacy Policy', '.'],
    nameLabel: 'Your full name',
    nameHelp: 'Typing your name counts as your signature.',
    tickConduct: 'Tick the box to accept the Code of Conduct.',
    tickTerms: 'Tick the box to accept the Terms of Use.',
    typeName: 'Type your full name to sign.',
    notSaved: 'That didn’t save. Please try again.',
    saving: 'Saving…',
    accept: 'Accept',
  },
  es: {
    signedOutTitle: 'Aceptar este código',
    signedOutBefore: 'Todos lo aceptan al crear una cuenta. Si ya tienes una,',
    signIn: 'inicia sesión',
    signedOutAfter: 'para aceptarlo.',
    acceptedTitle: 'Ya aceptaste este código',
    acceptedOn: (date) => `Lo aceptaste el ${date}. `,
    thanks: 'Gracias por ayudar a que Note by Note siga siendo un buen lugar para aprender.',
    acceptTitle: 'Acepta el Código de conducta',
    acceptIntro: 'Acéptalo para seguir usando tu cuenta. Guardamos un registro de la fecha y del nombre que escribas.',
    conductTick: ['He leído el ', 'Código de conducta', ' y acepto cumplirlo.'],
    termsTick: ['También acepto las ', 'Condiciones de uso', ' y he leído la ', 'Política de privacidad', '.'],
    nameLabel: 'Tu nombre completo',
    nameHelp: 'Escribir tu nombre cuenta como tu firma.',
    tickConduct: 'Marca la casilla para aceptar el Código de conducta.',
    tickTerms: 'Marca la casilla para aceptar las Condiciones de uso.',
    typeName: 'Escribe tu nombre completo para firmar.',
    notSaved: 'No se pudo guardar. Inténtalo de nuevo.',
    saving: 'Guardando…',
    accept: 'Aceptar',
  },
  fr: {
    signedOutTitle: 'Accepter ce code',
    signedOutBefore: 'Tout le monde l’accepte en créant un compte. Si vous en avez déjà un,',
    signIn: 'connectez-vous',
    signedOutAfter: 'pour l’accepter.',
    acceptedTitle: 'Vous avez accepté ce code',
    acceptedOn: (date) => `Vous l’avez accepté le ${date}. `,
    thanks: 'Merci d’aider Note by Note à rester un bon endroit pour apprendre.',
    acceptTitle: 'Accepter le Code de conduite',
    acceptIntro: 'Veuillez l’accepter pour continuer à utiliser votre compte. Nous gardons une trace de la date et du nom que vous tapez.',
    conductTick: ['J’ai lu le ', 'Code de conduite', ' et je m’engage à le respecter.'],
    termsTick: ['J’accepte aussi les ', 'Conditions d’utilisation', ' et j’ai lu la ', 'Politique de confidentialité', '.'],
    nameLabel: 'Votre nom complet',
    nameHelp: 'Taper votre nom vaut signature.',
    tickConduct: 'Cochez la case pour accepter le Code de conduite.',
    tickTerms: 'Cochez la case pour accepter les Conditions d’utilisation.',
    typeName: 'Tapez votre nom complet pour signer.',
    notSaved: 'L’enregistrement n’a pas fonctionné. Veuillez réessayer.',
    saving: 'Enregistrement…',
    accept: 'Accepter',
  },
};

export interface ConsentFormText {
  howTitle: string;
  howBody: string;
  invalidTitle: string;
  openFailed: string;
  opening: string;
  givenTitle: string;
  givenBody: (guardianName: string, student: string, date: string) => string;
  /** Used when the link has no first name. */
  yourChild: string;
  formTitle: (student: string) => string;
  formIntro: string;
  fullName: string;
  email: string;
  relationship: (student: string) => string;
  choose: string;
  /** Labels for the values the server accepts. */
  relationships: Record<'Parent' | 'Legal guardian' | 'Other caregiver', string>;
  confirmLegend: string;
  tickGuardian: (student: string) => string;
  tickLessons: (student: string) => string;
  tickPolicies: string;
  signLabel: string;
  signHelp: string;
  tickAll: string;
  notSaved: string;
  saving: string;
  submit: string;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
/** French drops the "e" of "de" before a vowel: "d’Emma", "de Sam". */
const deFr = (name: string) => (/^[aeiouyàâäéèêëîïôöûü]/i.test(name) ? `d’${name}` : `de ${name}`);

export const CONSENT_FORM: Record<PolicyLanguage, ConsentFormText> = {
  en: {
    howTitle: 'How to give consent',
    howBody:
      'Your child can send you a private link from their Note by Note dashboard, or we email it to the address on their application. Open that link and the consent form appears here. If you manage your child’s account yourself, the link is on their dashboard.',
    invalidTitle: 'This link doesn’t work',
    openFailed: 'We couldn’t open this link. Please try again.',
    opening: 'Opening the consent form',
    givenTitle: 'Consent given',
    givenBody: (guardian, student, date) =>
      `${guardian ? `${guardian} gave` : 'A parent or guardian gave'} consent for ${student}${date ? ` on ${date}` : ''}. Thank you.`,
    yourChild: 'your child',
    formTitle: (student) => `Give consent for ${student}`,
    formIntro: 'Please check your details, tick each box and type your name. We keep a record of what you agreed to and when.',
    fullName: 'Your full name',
    email: 'Your email',
    relationship: (student) => `Your relationship to ${student}`,
    choose: 'Choose…',
    relationships: { Parent: 'Parent', 'Legal guardian': 'Legal guardian', 'Other caregiver': 'Other caregiver' },
    confirmLegend: 'I confirm that',
    tickGuardian: (student) => `I am ${student}’s parent or legal guardian, or the caregiver responsible for them.`,
    tickLessons: (student) =>
      `${capitalize(student)} may take free online lessons with a volunteer mentor and use the Note by Note website as described above.`,
    tickPolicies: 'I’ve read the Code of Conduct and Privacy Policy. For a child under 13, an adult will be nearby during lessons.',
    signLabel: 'Type your full name to sign',
    signHelp: 'This counts as your signature.',
    tickAll: 'Please tick each box to give consent.',
    notSaved: 'That didn’t save. Please try again.',
    saving: 'Saving…',
    submit: 'Give consent',
  },
  es: {
    howTitle: 'Cómo dar su consentimiento',
    howBody:
      'Su hijo o hija puede enviarle un enlace privado desde su panel de Note by Note, o se lo enviamos por correo a la dirección que aparece en su solicitud. Abra ese enlace y el formulario de consentimiento aparecerá aquí. Si usted administra la cuenta de su hijo o hija, el enlace está en su panel.',
    invalidTitle: 'Este enlace no funciona',
    openFailed: 'No pudimos abrir este enlace. Inténtelo de nuevo.',
    opening: 'Abriendo el formulario de consentimiento',
    givenTitle: 'Consentimiento dado',
    givenBody: (guardian, student, date) =>
      `${guardian || 'Un padre, madre o tutor'} dio su consentimiento para ${student}${date ? ` el ${date}` : ''}. Gracias.`,
    yourChild: 'su hijo o hija',
    formTitle: (student) => `Dar consentimiento para ${student}`,
    formIntro: 'Revise sus datos, marque cada casilla y escriba su nombre. Guardamos un registro de lo que aceptó y cuándo.',
    fullName: 'Su nombre completo',
    email: 'Su correo electrónico',
    relationship: (student) => `Su relación con ${student}`,
    choose: 'Elija…',
    relationships: { Parent: 'Padre o madre', 'Legal guardian': 'Tutor legal', 'Other caregiver': 'Otra persona a cargo' },
    confirmLegend: 'Confirmo que',
    tickGuardian: (student) => `Soy el padre, la madre o el tutor legal de ${student}, o la persona responsable de su cuidado.`,
    tickLessons: (student) =>
      `${capitalize(student)} puede tomar clases gratuitas en línea con un mentor voluntario y usar el sitio web de Note by Note como se describe arriba.`,
    tickPolicies:
      'He leído el Código de conducta y la Política de privacidad. Si el niño o la niña tiene menos de 13 años, un adulto estará cerca durante las clases.',
    signLabel: 'Escriba su nombre completo para firmar',
    signHelp: 'Esto cuenta como su firma.',
    tickAll: 'Marque cada casilla para dar su consentimiento.',
    notSaved: 'No se pudo guardar. Inténtelo de nuevo.',
    saving: 'Guardando…',
    submit: 'Dar consentimiento',
  },
  fr: {
    howTitle: 'Comment donner votre consentement',
    howBody:
      'Votre enfant peut vous envoyer un lien privé depuis son tableau de bord Note by Note, ou nous l’envoyons par courriel à l’adresse indiquée dans sa candidature. Ouvrez ce lien et le formulaire de consentement apparaîtra ici. Si vous gérez vous-même le compte de votre enfant, le lien se trouve sur son tableau de bord.',
    invalidTitle: 'Ce lien ne fonctionne pas',
    openFailed: 'Nous n’avons pas pu ouvrir ce lien. Veuillez réessayer.',
    opening: 'Ouverture du formulaire de consentement',
    givenTitle: 'Consentement donné',
    givenBody: (guardian, student, date) =>
      `${guardian || 'Un parent ou un tuteur'} a donné son consentement pour ${student}${date ? ` le ${date}` : ''}. Merci.`,
    yourChild: 'votre enfant',
    formTitle: (student) => `Donner votre consentement pour ${student}`,
    formIntro:
      'Vérifiez vos informations, cochez chaque case et tapez votre nom. Nous gardons une trace de ce que vous avez accepté et de la date.',
    fullName: 'Votre nom complet',
    email: 'Votre courriel',
    relationship: (student) => `Votre lien avec ${student}`,
    choose: 'Choisir…',
    relationships: { Parent: 'Parent', 'Legal guardian': 'Tuteur légal', 'Other caregiver': 'Autre personne responsable' },
    confirmLegend: 'Je confirme que',
    tickGuardian: (student) => `Je suis le parent ou le tuteur légal ${deFr(student)}, ou la personne qui en a la charge.`,
    tickLessons: (student) =>
      `${capitalize(student)} peut suivre des cours gratuits en ligne avec un mentor bénévole et utiliser le site de Note by Note comme décrit ci-dessus.`,
    tickPolicies:
      'J’ai lu le Code de conduite et la Politique de confidentialité. Pour un enfant de moins de 13 ans, un adulte sera à proximité pendant les cours.',
    signLabel: 'Tapez votre nom complet pour signer',
    signHelp: 'Cela vaut signature.',
    tickAll: 'Veuillez cocher chaque case pour donner votre consentement.',
    notSaved: 'L’enregistrement n’a pas fonctionné. Veuillez réessayer.',
    saving: 'Enregistrement…',
    submit: 'Donner mon consentement',
  },
};
