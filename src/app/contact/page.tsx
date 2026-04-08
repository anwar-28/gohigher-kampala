"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { createMessage } from "@/lib/services";
import { Button, Textarea, Card, PageHeader } from "@/components/ui";
import { Mail, CheckCircle2, Phone, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    setSubmitting(true);
    try {
      await createMessage(user.$id, message);
      toast.success("Message sent! We'll respond soon.");
      setMessage("");
      setSent(true);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send message",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="animate-in max-w-4xl">
        <PageHeader
          title="Contact Authorities"
          subtitle="Send a message to Kampala City Council or KCCA environment team"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {sent ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3
                    className="font-bold text-slate-800 text-lg mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Message Sent!
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Your message has been received. The team typically responds
                    within 2 business days.
                  </p>
                  <Button variant="secondary" onClick={() => setSent(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-slate-800"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Send a Message
                      </h3>
                      <p className="text-xs text-slate-400">
                        Logged in as {user?.email}
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                      label="Your Message"
                      placeholder="Describe your concern, suggestion, or request..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                    />
                    <Button
                      type="submit"
                      loading={submitting}
                      disabled={!message.trim()}
                    >
                      <Mail size={15} />
                      Send Message
                    </Button>
                  </form>
                </>
              )}
            </Card>
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            <Card className="p-5">
              <h4
                className="font-bold text-slate-700 mb-4 text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Contact Info
              </h4>
              <div className="space-y-4">
                {[
                  {
                    icon: Phone,
                    label: "KCCA Environment",
                    value: "+256 414 233 700",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "environment@kcca.go.ug",
                  },
                  {
                    icon: MapPin,
                    label: "Office",
                    value: "City Hall, Kampala Road",
                  },
                  { icon: Clock, label: "Hours", value: "Mon–Fri, 8am – 5pm" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-medium text-slate-700">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 bg-blue-600 border-blue-600">
              <h4
                className="font-bold text-white mb-2 text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Emergency Hotline
              </h4>
              <p className="text-blue-200 text-xs mb-3">
                For urgent environmental hazards (illegal dumping, chemical
                spills)
              </p>
              <p
                className="text-yellow-400 text-xl font-bold"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                0800 213 000
              </p>
              <p className="text-blue-300 text-xs mt-1">Toll-free, 24/7</p>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
