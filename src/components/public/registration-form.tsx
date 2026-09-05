"use client";

import { useRef, useState, type FormEvent } from "react";

import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { registrationSchema } from "@/lib/validation/registration";

import styles from "./registration-form.module.css";

type RegistrationFormProps = {
  priceLabel: string;
  locale: Locale;
};

export function RegistrationForm({ priceLabel, locale }: RegistrationFormProps) {
  const copy = getMessages(locale).registration;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  function showInvalidFields(fields: string[]) {
    const knownFields = fields.filter((field) => Object.hasOwn(copy.fieldErrors, field));
    setInvalidFields(knownFields);
    setError(copy.errors.invalid);
    const firstInput = formRef.current?.elements.namedItem(knownFields[0]);
    if (firstInput instanceof HTMLInputElement) firstInput.focus();
  }

  function fieldProps(name: string) {
    return {
      id: `registration-${name}`,
      "aria-invalid": invalidFields.includes(name) || undefined,
      "aria-describedby": invalidFields.includes(name) ? `registration-error-${name}` : undefined,
    };
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loading) void submit(new FormData(event.currentTarget));
  }

  async function submit(formData: FormData) {
    setError(null);
    setInvalidFields([]);
    const body = {
      ...Object.fromEntries(formData),
      locale,
      acceptedTerms: formData.get("acceptedTerms") === "on",
      acceptedPrivacy: formData.get("acceptedPrivacy") === "on",
      acceptedMarketing: formData.get("acceptedMarketing") === "on",
    };

    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      showInvalidFields([...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))]);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.status === 422) {
        const fields = data.fields && typeof data.fields === "object" ? Object.keys(data.fields) : [];
        showInvalidFields(fields);
        setLoading(false);
        return;
      }
      if (!response.ok || !data.url) {
        const errorCode = typeof data.code === "string" ? data.code : "PAYMENT_FAILED";
        const errorMessages: Record<string, string> = {
          INVALID_REGISTRATION: copy.errors.invalid,
          TOURNAMENT_CLOSED: copy.errors.closed,
          ALREADY_REGISTERED: copy.errors.duplicate,
          PAYMENT_FAILED: copy.errors.generic,
        };
        throw new Error(errorMessages[errorCode] ?? copy.errors.generic);
      }
      window.location.assign(data.url);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : copy.errors.unexpected);
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={styles.form}>
      <div className={styles.heading}>
        <span>{copy.playerRegistration}</span>
        <h3>{copy.title}</h3>
        <p>{copy.required}</p>
      </div>

      {error && (
        <div className={styles.error} role="alert" aria-live="polite">
          <p>{error}</p>
          {invalidFields.length > 0 && <ul>{invalidFields.map((field) => (
            <li key={field} id={`registration-error-${field}`}>
              <a href={`#registration-${field}`}>{copy.fieldErrors[field as keyof typeof copy.fieldErrors]}</a>
            </li>
          ))}</ul>}
        </div>
      )}

      <div className={styles.fields}>
        <label>
          <span>{copy.fullName}</span>
          <input {...fieldProps("fullName")} name="fullName" autoComplete="name" placeholder={copy.fullNamePlaceholder} required />
        </label>
        <label>
          <span>{copy.dni}</span>
          <input
            className={styles.identityInput}
            name="dni"
            {...fieldProps("dni")}
            autoComplete="off"
            placeholder="12345678Z"
            maxLength={12}
            required
          />
        </label>
        <label>
          <span>{copy.email}</span>
          <input {...fieldProps("email")} name="email" type="email" autoComplete="email" placeholder={copy.emailPlaceholder} required />
        </label>
        <label>
          <span>{copy.phone}</span>
          <input
            name="phone"
            {...fieldProps("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={copy.phonePlaceholder}
            maxLength={30}
            required
          />
        </label>
        <label>
          <span>{copy.fortnite}</span>
          <input {...fieldProps("epicUsername")} name="epicUsername" autoComplete="off" placeholder={copy.fortnitePlaceholder} required />
        </label>
        <label>
          <span>{copy.discord}</span>
          <input {...fieldProps("discordUsername")} name="discordUsername" autoComplete="off" placeholder="usuari" required />
        </label>
        <label>
          <span>{copy.postalCode}</span>
          <input
            name="postalCode"
            {...fieldProps("postalCode")}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="08001"
            pattern="[0-9]{5}"
            maxLength={5}
            required
          />
        </label>
      </div>

      <p className={styles.dataNote}>{copy.dataNote}</p>

      <div className={styles.consents}>
        <label>
          <input {...fieldProps("acceptedTerms")} name="acceptedTerms" type="checkbox" required />
          <span>{copy.acceptTermsLead} <a href="/legal/terms" target="_blank">{copy.terms}</a> {copy.acceptTermsTail}</span>
        </label>
        <label>
          <input {...fieldProps("acceptedPrivacy")} name="acceptedPrivacy" type="checkbox" required />
          <span>{copy.privacyLead} <a href="/legal/privacy" target="_blank">{copy.privacy}</a>.</span>
        </label>
        <label className={styles.optionalConsent}>
          <input {...fieldProps("acceptedMarketing")} name="acceptedMarketing" type="checkbox" />
          <span>{copy.marketingConsent}</span>
        </label>
      </div>

      <button disabled={loading} type="submit">
        <span>{loading ? copy.loading : copy.submit(priceLabel)}</span>
        <span aria-hidden="true">↗</span>
      </button>
      <p className={styles.secureNote}>
        <span aria-hidden="true">◆</span>
        {copy.secure}
      </p>
    </form>
  );
}
