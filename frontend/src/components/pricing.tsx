import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export default function Pricing() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1>
                    <p>Choose the plan that fits your legal workflow. Flexible options for individuals, teams, and enterprises.</p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-4">
                    {/* Starter Plan */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-medium">Starter Plan</CardTitle>
                            <span className="my-3 block text-2xl font-semibold">$49 / mo</span>
                            <CardDescription className="text-sm">Basic document management</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />
                            <ul className="list-outside space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="size-3" />
                                    Basic document management
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-3" />
                                    Limited access to state-specific templates
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter className="mt-auto">
                            <Button asChild variant="outline" className="w-full">
                                <Link href="">Get Started</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-medium">Pro Plan</CardTitle>
                            <span className="my-3 block text-2xl font-semibold">$199 / mo</span>
                            <CardDescription className="text-sm">Standard document management</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />
                            <ul className="list-outside space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="size-3" />
                                    Unlimited template downloads
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-3" />
                                    Standard document management
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-3" />
                                    Basic AI-powered judgment summaries (limited monthly)
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter className="mt-auto">
                            <Button asChild className="w-full">
                                <Link href="">Get Started</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Premium Plan */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-medium">Premium Plan</CardTitle>
                            <span className="my-3 block text-2xl font-semibold">$499 / mo</span>
                            <CardDescription className="text-sm">Unlimited document & template usage</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />
                            <ul className="list-outside space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="size-3" />
                                    Unlimited document & template usage
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-3" />
                                    Full AI judgment summarization
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-3" />
                                    Legal loophole analysis
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="size-3" />
                                    Custom AI-generated legal research reports
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter className="mt-auto">
                            <Button asChild variant="outline" className="w-full">
                                <Link href="">Get Started</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Enterprise License */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-medium">Enterprise License</CardTitle>
                            <span className="my-3 block text-2xl font-semibold">Custom Pricing</span>
                            <CardDescription className="text-sm">Starting at $10,000/year</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />
                            <ul className="list-outside space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="size-3" />
                                    API access, white-labeling, scalable deployment across firm users
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter className="mt-auto">
                            <Button asChild variant="outline" className="w-full">
                                <Link href="">Contact Sales</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Additional Options
                <div className="mx-auto mt-12 max-w-2xl space-y-4 text-center">
                    <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
                        <span role="img" aria-label="briefcase">💼</span> Additional Options
                    </h2>
                    <div className="text-sm space-y-2">
                        <div>
                            <span className="font-medium">Pay-Per-Use:</span>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>$9 per additional document beyond monthly limit</li>
                                <li>$50 per AI-generated legal research report (on-demand)</li>
                            </ul>
                        </div>
                        <div>
                            <span className="font-medium">Free Trial:</span>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>7-day trial with Starter Plan features</li>
                                <li>Up to 3 documents included</li>
                            </ul>
                        </div>
                    </div>
                </div> */}
            </div>
        </section>
    )
}
