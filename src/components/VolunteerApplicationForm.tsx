
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Heart, AlertCircle, User, MapPin, Phone, Mail, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  // Personal Information
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  address: z.string().min(5, { message: "Please enter your full address." }),
  city: z.string().min(2, { message: "Please enter your city." }),
  state: z.string().min(2, { message: "Please enter your state." }),
  zipCode: z.string().min(5, { message: "Please enter a valid ZIP code." }),
  dateOfBirth: z.string().optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().min(2, { message: "Please provide an emergency contact name." }),
  emergencyContactPhone: z.string().min(10, { message: "Please provide a valid emergency contact phone number." }),
  emergencyContactRelationship: z.string().min(2, { message: "Please specify your relationship to the emergency contact." }),
  
  // Volunteer Preferences
  opportunity: z.string({ required_error: "Please select an opportunity." }),
  availability: z.array(z.string()).nonempty({ message: "Please select at least one availability option." }),
  startDate: z.string().min(1, { message: "Please indicate when you can start." }),
  
  // Skills & Experience
  experience: z.string().optional(),
  skills: z.string().optional(),
  languages: z.string().optional(),
  
  // Background Information
  hasCriminalRecord: z.boolean().default(false),
  criminalRecordDetails: z.string().optional(),
  
  // Additional Information
  message: z.string().min(10, { message: "Please tell us a bit about your interest." }),
  
  // Agreement
  agreeToBackgroundCheck: z.boolean().refine(value => value === true, {
    message: "You must agree to a background check to volunteer.",
  }),
  agreeToTerms: z.boolean().refine(value => value === true, {
    message: "You must agree to the terms and conditions to volunteer.",
  }),
  agreeToCodeOfConduct: z.boolean().refine(value => value === true, {
    message: "You must agree to follow our code of conduct.",
  }),
  agreeToRelease: z.boolean().refine(value => value === true, {
    message: "You must agree to the liability release to volunteer.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface VolunteerApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VolunteerApplicationForm: React.FC<VolunteerApplicationFormProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      dateOfBirth: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      opportunity: "",
      availability: [],
      startDate: "",
      experience: "",
      skills: "",
      languages: "",
      hasCriminalRecord: false,
      criminalRecordDetails: "",
      message: "",
      agreeToBackgroundCheck: false,
      agreeToTerms: false,
      agreeToCodeOfConduct: false,
      agreeToRelease: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    // Here you would send the form data to your backend
    
    toast({
      title: "Application Submitted!",
      description: "Thank you for your interest in volunteering. We'll contact you soon.",
      duration: 5000,
    });
    
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/fb949545-3500-4403-9a6b-3532aa878cef.png" 
              alt="P.I.L.L.A.R. Initiative Logo" 
              className="h-24 object-contain"
            />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">Volunteer Application</DialogTitle>
          <DialogDescription className="text-center">
            Fill out this form to apply for a volunteer position with the P.I.L.L.A.R. Initiative.
            <p className="mt-2 text-xs text-muted-foreground">
              All information provided is confidential and will only be used for volunteer coordination and legally required record-keeping.
            </p>
          </DialogDescription>
          <Separator className="my-2" />
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-redcross" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Legal Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name as it appears on your ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Your street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Your city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Your state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Your ZIP code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Emergency Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-redcross" />
                <h3 className="text-lg font-semibold">Emergency Contact</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Emergency contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Phone <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Emergency contact phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="emergencyContactRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to Emergency Contact <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Spouse, Parent, Friend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            {/* Volunteer Preferences Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-redcross" />
                <h3 className="text-lg font-semibold">Volunteer Preferences</h3>
              </div>
              
              <FormField
                control={form.control}
                name="opportunity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I'm interested in <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an opportunity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mentorship">Mentorship Program</SelectItem>
                        <SelectItem value="renovation">Housing Renovation</SelectItem>
                        <SelectItem value="education">Education & Training</SelectItem>
                        <SelectItem value="administrative">Administrative Support</SelectItem>
                        <SelectItem value="events">Event Planning</SelectItem>
                        <SelectItem value="fundraising">Fundraising</SelectItem>
                        <SelectItem value="other">Other Opportunities</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="availability"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Availability <span className="text-red-500">*</span></FormLabel>
                      <FormDescription>
                        Which days are you typically available to volunteer?
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <FormField
                          key={day}
                          control={form.control}
                          name="availability"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValue, day])
                                        : field.onChange(
                                            currentValue.filter(
                                              (value) => value !== day
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {day}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When can you start? <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            {/* Skills & Experience Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5 text-redcross" />
                <h3 className="text-lg font-semibold">Skills & Experience</h3>
              </div>
              
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Experience</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about any relevant experience you have" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include volunteer work, professional experience, or any other relevant background.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Skills or Qualifications</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List any special skills or qualifications you have" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Languages Spoken</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="List any languages you speak fluently" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            {/* Background Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-redcross" />
                <h3 className="text-lg font-semibold">Background Information</h3>
              </div>
              
              <FormField
                control={form.control}
                name="hasCriminalRecord"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Do you have a criminal record?
                      </FormLabel>
                      <FormDescription>
                        A criminal record will not necessarily disqualify you from volunteering. Each case is considered individually.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {form.watch("hasCriminalRecord") && (
                <FormField
                  control={form.control}
                  name="criminalRecordDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please provide details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please provide details about your criminal record" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <Separator />
            
            {/* Additional Information */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to volunteer with us? <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us why you're interested in volunteering with us" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            {/* Legal Agreements */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-redcross" />
                <h3 className="text-lg font-semibold">Legal Agreements</h3>
              </div>
              
              <FormField
                control={form.control}
                name="agreeToBackgroundCheck"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Background Check Authorization <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        I authorize the P.I.L.L.A.R. Initiative to conduct a background check, which may include criminal history, references, and verification of information provided in this application.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="agreeToCodeOfConduct"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Code of Conduct Agreement <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        I agree to adhere to the P.I.L.L.A.R. Initiative's Code of Conduct, including maintaining confidentiality of sensitive information, treating all individuals with respect, and following all organizational policies and procedures.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="agreeToRelease"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Liability Release <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        I release the P.I.L.L.A.R. Initiative from any liability or claim related to injury, illness, damage, or loss that may result from my volunteer activities. I understand the risks involved with volunteering.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Terms and Conditions <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        I certify that all information provided in this application is true and complete. I understand that false information may result in rejection of my application or termination of my volunteer service. I agree to the terms and conditions of volunteering with the P.I.L.L.A.R. Initiative.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="text-xs text-muted-foreground italic">
              <p>Fields marked with <span className="text-red-500">*</span> are required.</p>
              <p className="mt-1">Information collected is protected under our Privacy Policy and will only be used for volunteer coordination and legally required record-keeping.</p>
            </div>
            
            <DialogFooter>
              <Button type="submit" className="w-full bg-redcross hover:bg-redcross/90">
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VolunteerApplicationForm;
